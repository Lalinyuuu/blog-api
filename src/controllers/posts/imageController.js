import prisma from '../../utils/prisma.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Delete image from Cloudinary
export const deleteImage = async (req, res) => {
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
      select: { id: true }
    });

    if (!user?.avatarPublicId?.includes(publicId) && !post) {
      return res.status(403).json({ error: 'Unauthorized to delete this image' });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    // Update database
    if (user?.avatarPublicId === publicId) {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          avatar: null,
          avatarPublicId: null
        }
      });
    }

    if (post) {
      await prisma.post.update({
        where: { id: post.id },
        data: { 
          image: null,
          imagePublicId: null
        }
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
      result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's images
export const getUserImages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Get user's posts with images
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: { 
          authorId: userId,
          image: { not: null }
        },
        select: {
          id: true,
          title: true,
          image: true,
          imagePublicId: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({
        where: { 
          authorId: userId,
          image: { not: null }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        images: posts.map(post => ({
          id: post.id,
          title: post.title,
          imageUrl: post.image,
          publicId: post.imagePublicId,
          uploadedAt: post.createdAt
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
