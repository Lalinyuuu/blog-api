import prisma from '../../utils/prisma.js';

// Get Time-based Statistics
export const getTimeBasedStatistics = async (req, res) => {
  try {
    const { period = '7d' } = req.query; // 7d, 30d, 90d, 1y
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Count posts created in period
    const postsInPeriod = await prisma.post.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Count likes in period
    const likesInPeriod = await prisma.like.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Count comments in period
    const commentsInPeriod = await prisma.comment.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Count new users in period
    const newUsersInPeriod = await prisma.user.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Get daily stats for the period
    const dailyStats = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [posts, likes, comments] = await Promise.all([
        prisma.post.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }),
        prisma.like.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }),
        prisma.comment.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        })
      ]);

      dailyStats.push({
        date: startOfDay.toISOString().split('T')[0],
        posts,
        likes,
        comments
      });
    }

    res.json({
      success: true,
      data: {
        period,
        postsInPeriod,
        likesInPeriod,
        commentsInPeriod,
        newUsersInPeriod,
        dailyStats: dailyStats.reverse()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
