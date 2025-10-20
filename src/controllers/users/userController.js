import prisma from '../../utils/prisma.js';

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;


    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: {
              where: { status: 'published' }
            },
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }


    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('=== Get User Profile Error ===', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};

// Get User Posts
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 6 } = req.query;


    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ตรวจสอบว่า user มีอยู่หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true }
    });

    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const posts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        status: 'published'
      },
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
            comments: true,
            shares: true,
            savedPosts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: parseInt(limit)
    });

    const total = await prisma.post.count({
      where: { 
        authorId: userId,
        status: 'published'
      }
    });


    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username
        },
        posts: posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('=== Get User Posts Error ===', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};

// Get User Statistics
export const getUserStatistics = async (req, res) => {
  try {
    const { userId } = req.params;


    // ตรวจสอบว่า user มีอยู่หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true }
    });

    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // นับจำนวน posts ที่ published
    const postsCount = await prisma.post.count({
      where: { 
        authorId: userId,
        status: 'published'
      }
    });

    // นับจำนวน likes ที่ได้รับ
    const totalLikesReceived = await prisma.like.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });

    // นับจำนวน comments ที่ได้รับ
    const totalCommentsReceived = await prisma.comment.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });

    // นับจำนวน saves ที่ได้รับ
    const totalSavesReceived = await prisma.savedPost.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });

    // นับจำนวน shares ที่ได้รับ
    const totalSharesReceived = await prisma.share.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });

    // นับจำนวน followers
    const followersCount = await prisma.follow.count({
      where: { followingId: userId }
    });

    // นับจำนวน following
    const followingCount = await prisma.follow.count({
      where: { followerId: userId }
    });


    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username
        },
        postsCount: postsCount,
        totalLikesReceived: totalLikesReceived,
        totalCommentsReceived: totalCommentsReceived,
        totalSavesReceived: totalSavesReceived,
        totalSharesReceived: totalSharesReceived,
        followersCount: followersCount,
        followingCount: followingCount
      }
    });
  } catch (error) {
    console.error('=== Get User Statistics Error ===', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};