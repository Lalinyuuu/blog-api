import prisma from '../../utils/prisma.js';
import { v2 as cloudinary } from 'cloudinary';
import { transformPostImage } from '../../utils/cloudinaryTransform.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const { file, folder, uploadType } = req.body;
    const userId = req.user.userId;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (req.originalUrl.includes('/post')) {
      return res.status(400).json({ 
        error: 'Wrong endpoint! Use /upload/avatar for avatars, not /upload/post!' 
      });
    }

    if (!uploadType) {
      return res.status(400).json({ error: 'uploadType is required' });
    }
    
    if (uploadType !== 'avatar') {
      return res.status(400).json({ 
        error: 'Invalid uploadType! Use "avatar" for avatar endpoint' 
      });
    }

    const uploadFolder = folder || 'avatars';

    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
      folder: uploadFolder,
    });

    const { secure_url, public_id } = result;

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
        avatar: secure_url,
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
      imageUrl: secure_url,
      publicId: public_id
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadPostImage = async (req, res) => {
  try {
    const { file, postId, folder, uploadType } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (req.originalUrl.includes('/avatar')) {
      return res.status(400).json({ 
        error: 'Wrong endpoint! Use /upload/post for post images, not /upload/avatar!' 
      });
    }

    if (!uploadType) {
      return res.status(400).json({ error: 'uploadType is required' });
    }
    
    if (uploadType !== 'post') {
      return res.status(400).json({ 
        error: 'Invalid uploadType! Use "post" for post endpoint' 
      });
    }

    const uploadFolder = folder || 'posts';

    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
      folder: uploadFolder,
      eager: [
        {
          width: 1200,
          height: 900,
          crop: 'fill',
          gravity: 'auto',
          quality: 'auto:good'
        }
      ]
    });

    let { secure_url, public_id } = result;
    secure_url = transformPostImage(secure_url);

    if (postId) {
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
          image: secure_url,
          imagePublicId: public_id
        }
      });
    }

    res.json({
      success: true,
      message: 'Post image uploaded successfully',
      imageUrl: secure_url,
      publicId: public_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};