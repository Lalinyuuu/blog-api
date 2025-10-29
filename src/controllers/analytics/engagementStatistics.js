import prisma from '../../utils/prisma.js';

// Get Engagement Statistics
export const getEngagementStatistics = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get daily engagement for last 7 days
    const dailyEngagement = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [likes, comments, shares, views] = await Promise.all([
        prisma.like.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }),
        prisma.comment.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }),
        prisma.share?.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }) || 0,
        prisma.post.aggregate({
          where: {
            status: 'published',
            createdAt: { gte: startOfDay, lte: endOfDay }
          },
          _sum: { viewCount: true }
        }).then(result => result._sum.viewCount || 0)
      ]);

      dailyEngagement.push({
        day: dayNames[date.getDay()],
        likes,
        comments,
        shares,
        views
      });
    }

    // Get weekly trends for last 4 weeks
    const weeklyTrends = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const [posts, users, likes, comments] = await Promise.all([
        prisma.post.count({
          where: {
            status: 'published',
            createdAt: { gte: weekStart, lt: weekEnd }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: { gte: weekStart, lt: weekEnd }
          }
        }),
        prisma.like.count({
          where: {
            createdAt: { gte: weekStart, lt: weekEnd }
          }
        }),
        prisma.comment.count({
          where: {
            createdAt: { gte: weekStart, lt: weekEnd }
          }
        })
      ]);

      const engagement = posts > 0 ? ((likes + comments) / posts).toFixed(1) : 0;

      weeklyTrends.push({
        week: `Week ${4 - i}`,
        engagement: parseFloat(engagement),
        posts,
        users
      });
    }

    // Calculate overall engagement rate
    const totalPosts = await prisma.post.count({ where: { status: 'published' } });
    const totalLikes = await prisma.like.count();
    const totalComments = await prisma.comment.count();
    const engagementRate = totalPosts > 0 ? 
      ((totalLikes + totalComments) / totalPosts * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        dailyEngagement,
        weeklyTrends,
        engagementRate: parseFloat(engagementRate),
        avgSessionTime: "4m 32s", // Mock data - you can implement real tracking
        bounceRate: 23.5, // Mock data
        returnVisitors: 67.8 // Mock data
      }
    });
  } catch (error) {
    console.error('Engagement statistics error:', error);
    res.status(500).json({ error: error.message });
  }
};
