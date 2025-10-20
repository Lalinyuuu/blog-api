import prisma from '../../utils/prisma.js';

// Like/Unlike Posts
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;


    // ตรวจสอบว่า post มีอยู่หรือไม่
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // ตรวจสอบว่า user เคย like แล้วหรือยัง
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    // เพิ่ม like
    const like = await prisma.like.create({
      data: {
        postId: postId,
        userId: userId
      }
    });

    // นับจำนวน likes ใหม่
    const likesCount = await prisma.like.count({
      where: { postId: postId }
    });

    // สร้าง notification สำหรับ author (ถ้าไม่ใช่ตัวเอง)
    if (post.authorId !== userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'like',
            postId: postId,
            fromUserId: userId,
            message: `${req.user.name} liked your post "${post.title}"`
          }
        });
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }
    }


    res.json({
      success: true,
      message: 'Post liked successfully',
      isLiked: true,
      likesCount: likesCount
    });
  } catch (error) {
    console.error('=== Like Post Error ===', error);
    res.status(500).json({ error: error.message });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;


    // ตรวจสอบว่า user เคย like แล้วหรือยัง
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    if (!existingLike) {
      return res.status(400).json({ error: 'Post not liked yet' });
    }

    // ลบ like
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    // นับจำนวน likes ใหม่
    const likesCount = await prisma.like.count({
      where: { postId: postId }
    });


    res.json({
      success: true,
      message: 'Post unliked successfully',
      isLiked: false,
      likesCount: likesCount
    });
  } catch (error) {
    console.error('=== Unlike Post Error ===', error);
    res.status(500).json({ error: error.message });
  }
};

// Save/Unsave Posts
export const savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;


    // ตรวจสอบว่า post มีอยู่หรือไม่
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, authorId: true }
    });

    if (!post) {
      console.error('Post not found:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }

    // ตรวจสอบว่า user เคย save แล้วหรือยัง
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    if (existingSave) {
      console.error('Post already saved:', postId);
      return res.status(400).json({ error: 'Post already saved' });
    }

    // เพิ่ม save
    const savedPost = await prisma.savedPost.create({
      data: {
        postId: postId,
        userId: userId
      }
    });


    res.json({
      success: true,
      message: 'Post saved successfully',
      isSaved: true,
      savedPostId: savedPost.id
    });
  } catch (error) {
    console.error('=== Save Post Error ===', error);
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

export const unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;


    // ตรวจสอบว่า user เคย save แล้วหรือยัง
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    if (!existingSave) {
      console.error('Post not saved yet:', postId);
      return res.status(400).json({ error: 'Post not saved yet' });
    }

    // ลบ save
    await prisma.savedPost.delete({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });


    res.json({
      success: true,
      message: 'Post unsaved successfully',
      isSaved: false
    });
  } catch (error) {
    console.error('=== Unsave Post Error ===', error);
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
