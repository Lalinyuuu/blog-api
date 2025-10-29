import prisma from '../../utils/prisma.js';

// Check User Interaction Status
export const checkUserInteraction = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // ตรวจสอบ like status
    const isLiked = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    // ตรวจสอบ save status
    const isSaved = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    res.json({
      success: true,
      isLiked: !!isLiked,
      isSaved: !!isSaved
    });
  } catch (error) {
    console.error('=== Check User Interaction Error ===', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};

// Get Saved Posts
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const savedPosts = await prisma.savedPost.findMany({
      where: { userId: userId },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            },
            categoryRelation: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            _count: {
              select: {
                likes: true,
                comments: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: parseInt(limit)
    });

    const total = await prisma.savedPost.count({
      where: { userId: userId }
    });

    res.json({
      success: true,
      data: {
        posts: savedPosts.map(item => ({
          ...item.post,
          savedAt: item.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('=== Get Saved Posts Error ===', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};

// Increment Post View Count
export const incrementViewCount = async (req, res) => {
  try {
    const { postId } = req.params;

    // ตรวจสอบว่า post มีอยู่หรือไม่
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, viewCount: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // เพิ่ม view count
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        viewCount: {
          increment: 1
        }
      },
      select: {
        id: true,
        viewCount: true
      }
    });

    res.json({
      success: true,
      message: 'View count incremented',
      viewCount: updatedPost.viewCount
    });
  } catch (error) {
    console.error('=== Increment View Count Error ===', error);
    res.status(500).json({ 
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};

// Share Post
export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId; // Optional for anonymous shares
    const { platform } = req.body;

    // ตรวจสอบว่า post มีอยู่หรือไม่
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true }
    });

    if (!post) {
      console.error('Post not found:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }

    // เพิ่ม share record
    const share = await prisma.share.create({
      data: {
        postId: postId,
        userId: userId,
        platform: platform
      }
    });

    res.json({
      success: true,
      message: 'Post shared successfully',
      shareId: share.id
    });
  } catch (error) {
    console.error('=== Share Post Error ===', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};
