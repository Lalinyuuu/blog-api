import prisma from '../../utils/prisma.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get image info
export const getImageInfo = async (req, res) => {
  try {
    const { publicId } = req.params;
    const userId = req.user.userId;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    // Check if user owns this image
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarPublicId: true }
    });

    const post = await prisma.post.findFirst({
      where: { 
        imagePublicId: publicId,
        authorId: userId 
      },
      select: { 
        id: true, 
        title: true, 
        image: true,
        imagePublicId: true,
        createdAt: true
      }
    });

    if (!user?.avatarPublicId?.includes(publicId) && !post) {
      return res.status(403).json({ error: 'Unauthorized to access this image' });
    }

    // Get image info from Cloudinary
    const imageInfo = await cloudinary.api.resource(publicId);

    res.json({
      success: true,
      data: {
        publicId: imageInfo.public_id,
        url: imageInfo.secure_url,
        format: imageInfo.format,
        width: imageInfo.width,
        height: imageInfo.height,
        size: imageInfo.bytes,
        createdAt: imageInfo.created_at,
        post: post ? {
          id: post.id,
          title: post.title,
          uploadedAt: post.createdAt
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
