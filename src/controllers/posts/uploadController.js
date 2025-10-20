import prisma from '../../utils/prisma.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteCloudinaryImage = async (publicId, context = 'unknown') => {
  try {
    // Emergency protection: ไม่ให้ลบ avatar เมื่อ context ไม่ใช่ avatar
    if (publicId.includes('avatars/') && context !== 'avatar') {
      throw new Error('EMERGENCY: Cannot delete avatar in non-avatar context!');
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

// Upload Avatar - รับ Base64
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

    // ใช้ folder จาก request หรือ fallback เป็น 'avatars'
    const uploadFolder = folder || 'avatars';

    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
      folder: uploadFolder,
    });

    const { secure_url, public_id } = result;

    // ลบรูปเก่าถ้ามี (เฉพาะใน avatar upload เท่านั้น)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarPublicId: true }
    });

    if (user?.avatarPublicId) {
      try {
        await deleteCloudinaryImage(user.avatarPublicId, 'avatar');
      } catch (error) {
        // Error deleting old avatar, but continue
      }
    }

    // อัปเดต avatar ใน database
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

    // ตรวจสอบว่าไม่มี post data ใน response
    if (response.post) {
      delete response.post;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload Post Image - รับ Base64
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

    // ใช้ folder จาก request หรือ fallback เป็น 'posts'
    const uploadFolder = folder || 'posts';

    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
      folder: uploadFolder,
    });

    const { secure_url, public_id } = result;

    // อัปเดต post image ใน database ถ้ามี postId
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { imagePublicId: true }
      });

      // ลบรูปเก่าถ้ามี
      if (post?.imagePublicId) {
        try {
          await deleteCloudinaryImage(post.imagePublicId, 'post');
        } catch (error) {
          // Error deleting old image, but continue
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