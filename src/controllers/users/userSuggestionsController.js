import prisma from '../../utils/prisma.js';

export const getUserSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user?.userId;
    const { limit = 5 } = req.query;

    const followingIds = currentUserId
      ? await prisma.follow.findMany({
          where: { followerId: currentUserId },
          select: { followingId: true }
        }).then(follows => follows.map(f => f.followingId))
      : [];

    const suggestions = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          { id: { notIn: followingIds } }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        _count: {
          select: {
            followers: true,
            posts: {
              where: { status: 'published' }
            }
          }
        }
      },
      orderBy: [
        { followers: { _count: 'desc' } },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit)
    });

    res.json({
      success: true,
      suggestions: suggestions
    });
  } catch (error) {
    console.error('Get user suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to get user suggestions' 
    });
  }
};

