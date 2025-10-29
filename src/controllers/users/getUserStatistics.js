import prisma from '../../utils/prisma.js';

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
