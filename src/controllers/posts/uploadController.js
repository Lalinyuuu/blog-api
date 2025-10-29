import prisma from '../../utils/prisma.js';
import { v2 as cloudinary } from 'cloudinary';
import { transformPostImage } from '../../utils/cloudinaryTransform.js';
import formidable from 'formidable';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 300000, // 5 minutes timeout
  secure: true,
});

// Formidable configuration for file uploads
const createFormidableForm = (options = {}) => {
  return formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFields: 10,
    maxFieldsSize: 1 * 1024 * 1024, // 1MB for fields
    filter: ({ mimetype }) => {
      // Only allow image files
      return mimetype && mimetype.startsWith('image/');
    },
    keepExtensions: true, // Keep file extensions
    uploadDir: '/tmp', // Temporary directory for file processing
    allowEmptyFiles: false, // Don't allow empty files
    minFileSize: 1, // Minimum file size
    ...options
  });
};

const deleteCloudinaryImage = async (publicId, context = 'unknown') => {
  try {
    if (publicId.includes('avatars/') && context !== 'avatar') {
      throw new Error('Cannot delete avatar in non-avatar context');
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (req.originalUrl.includes('/post')) {
      return res.status(400).json({ 
        error: 'Wrong endpoint! Use /upload/avatar for avatars, not /upload/post!' 
      });
    }


    let file, folder, uploadType;

    // Check if request is base64 (from frontend) or multipart (from form)
    if (req.body && req.body.file && typeof req.body.file === 'string') {
      // Handle base64 data from frontend
      
      const { file: base64Data, folder: reqFolder, uploadType: reqUploadType } = req.body;
      
      if (!base64Data) {
        return res.status(400).json({ error: 'No file data provided' });
      }

      // Use data URI directly for Cloudinary
      const dataUri = base64Data;
      
      // Create a temporary file object for Cloudinary
      file = {
        filepath: dataUri,
        size: dataUri.length,
        mimetype: 'image/jpeg'
      };
      
      folder = reqFolder || 'avatars';
      uploadType = reqUploadType || 'avatar'; // Default to 'avatar' if not provided
      
    } else {
      // Handle multipart form data
      
      const form = createFormidableForm();
      const [fields, files] = await form.parse(req);


      // Check for different field names that frontend might use
      file = files.file?.[0] || files.avatar?.[0];
      folder = fields.folder?.[0] || 'avatars';
      uploadType = fields.uploadType?.[0] || fields.type?.[0] || 'avatar'; // Check both 'uploadType' and 'type'
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Set default uploadType to 'avatar' if not provided
    if (!uploadType) {
      uploadType = 'avatar';
    }
    
    if (uploadType !== 'avatar') {
      return res.status(400).json({ 
        error: 'Invalid uploadType! Use "avatar" for avatar endpoint' 
      });
    }

    // Upload to Cloudinary with avatar-specific transformations
    const uploadOptions = {
      resource_type: 'auto',
      folder: folder,
      timeout: 300000, // 5 minutes
      chunk_size: 6000000, // 6MB chunks for better performance
      quality: 'auto:good', // Auto compression
      fetch_format: 'auto', // Auto format optimization
      eager: [
        {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'center',
          quality: 'auto:good'
        }
      ]
    };

    // Use filepath for local files or data URI for base64
    let uploadSource;
    
    if (typeof file.filepath === 'string' && file.filepath.startsWith('data:')) {
      // Base64 data URI
      uploadSource = file.filepath;
    } else {
      // Local file - convert to base64 data URI
      const fs = await import('fs');
      const fileBuffer = fs.readFileSync(file.filepath);
      const base64String = fileBuffer.toString('base64');
      uploadSource = `data:${file.mimetype};base64,${base64String}`;
    }


    const result = await cloudinary.uploader.upload(uploadSource, uploadOptions);

    const { secure_url, public_id, eager } = result;
    
    // Use the eager transformation URL for avatar (400x400 square)
    const transformedUrl = eager && eager[0] ? eager[0].secure_url : secure_url;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarPublicId: true }
    });

    if (user?.avatarPublicId) {
      try {
        await deleteCloudinaryImage(user.avatarPublicId, 'avatar');
      } catch (error) {
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        avatar: transformedUrl,
        avatarPublicId: public_id
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        avatarPublicId: true,
        email: true
      }
    });

    const response = {
      success: true,
      message: 'Avatar uploaded successfully',
      user: updatedUser,
      imageUrl: transformedUrl,
      publicId: public_id
    };

    res.json(response);
  } catch (error) {
    
    // Handle specific formidable errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field. Use "file" field name.' });
    }
    
    if (error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ error: 'Only image files are allowed.' });
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({ 
        error: 'Upload timeout. Please try again with a smaller file or check your connection.' 
      });
    }
    
    // Handle Cloudinary errors
    if (error.http_code) {
      return res.status(400).json({ 
        error: `Cloudinary error: ${error.message}` 
      });
    }
    
    res.status(500).json({ error: error.message || 'Avatar upload failed' });
  }
};

export const uploadPostImage = async (req, res) => {
  try {
    if (req.originalUrl.includes('/avatar')) {
      return res.status(400).json({ 
        error: 'Wrong endpoint! Use /upload/post for post images, not /upload/avatar!' 
      });
    }

    let file, postId, folder, uploadType;

    // Check if request is base64 (from frontend) or multipart (from form)
    if (req.body && req.body.file && typeof req.body.file === 'string') {
      // Handle base64 data from frontend
      
      const { file: base64Data, postId: reqPostId, folder: reqFolder, uploadType: reqUploadType } = req.body;
      
      if (!base64Data) {
        return res.status(400).json({ error: 'No file data provided' });
      }

      // Use data URI directly for Cloudinary
      const dataUri = base64Data;
      
      // Create a temporary file object for Cloudinary
      file = {
        filepath: dataUri,
        size: dataUri.length,
        mimetype: 'image/jpeg'
      };
      
      postId = reqPostId;
      folder = reqFolder || 'posts';
      uploadType = reqUploadType;
      
    } else {
      // Handle multipart form data
      
      const form = createFormidableForm();
      const [fields, files] = await form.parse(req);



      // Check for different field names that frontend might use
      file = files.file?.[0] || files.image?.[0];
      postId = fields.postId?.[0];
      folder = fields.folder?.[0] || 'posts';
      uploadType = fields.uploadType?.[0] || fields.type?.[0];
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Set default uploadType if not provided
    if (!uploadType) {
      uploadType = 'post';
    }
    
    if (uploadType !== 'post' && uploadType !== 'post-image') {
      return res.status(400).json({ 
        error: 'Invalid uploadType! Use "post" or "post-image" for post endpoint' 
      });
    }

    // Upload to Cloudinary with post-specific transformations
    const uploadOptions = {
      resource_type: 'auto',
      folder: folder,
      timeout: 300000, // 5 minutes
      chunk_size: 6000000, // 6MB chunks for better performance
      quality: 'auto:good', // Auto compression
      fetch_format: 'auto', // Auto format optimization
      eager: [
        {
          width: 1920,
          height: 1080,
          crop: 'fill',
          gravity: 'center',
          quality: 'auto:good'
        }
      ]
    };

    // Use filepath for local files or data URI for base64
    let uploadSource;
    
    if (typeof file.filepath === 'string' && file.filepath.startsWith('data:')) {
      // Base64 data URI
      uploadSource = file.filepath;
    } else {
      // Local file - convert to base64 data URI
      const fs = await import('fs');
      const fileBuffer = fs.readFileSync(file.filepath);
      const base64String = fileBuffer.toString('base64');
      uploadSource = `data:${file.mimetype};base64,${base64String}`;
    }

    const result = await cloudinary.uploader.upload(uploadSource, uploadOptions);

    // Use the eager transformation URL directly
    const { secure_url, public_id, eager } = result;
    const transformedUrl = eager && eager[0] ? eager[0].secure_url : secure_url;

    if (postId) {
      // Update existing post
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { imagePublicId: true }
      });

      if (post?.imagePublicId) {
        try {
          await deleteCloudinaryImage(post.imagePublicId, 'post');
        } catch (error) {
        }
      }

      await prisma.post.update({
        where: { id: postId },
        data: { 
          image: transformedUrl,
          imagePublicId: public_id
        }
      });
    } else {
      // Don't create new post automatically - just return the image URL
      // Let the frontend handle post creation with proper title
      return res.json({
        success: true,
        message: 'Image uploaded successfully. Please create a post with a proper title.',
        imageUrl: transformedUrl,
        publicId: public_id,
        requiresPostCreation: true
      });
    }

    res.json({
      success: true,
      message: 'Post image uploaded successfully',
      imageUrl: transformedUrl,
      publicId: public_id
    });
  } catch (error) {
    
    // Handle specific formidable errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field. Use "file" field name.' });
    }
    
    if (error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ error: 'Only image files are allowed.' });
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({ 
        error: 'Upload timeout. Please try again with a smaller file or check your connection.' 
      });
    }
    
    // Handle Cloudinary errors
    if (error.http_code) {
      return res.status(400).json({ 
        error: `Cloudinary error: ${error.message}` 
      });
    }
    
    res.status(500).json({ error: error.message || 'Post image upload failed' });
  }
};