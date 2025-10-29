import prisma from '../../utils/prisma.js';

// Get Overall Platform Statistics
export const getPlatformStatistics = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count total users
    const totalUsers = await prisma.user.count();

    // Count total posts (published only)
    const totalPosts = await prisma.post.count({
      where: { status: 'published' }
    });

    // Count total likes
    const totalLikes = await prisma.like.count();

    // Count total comments
    const totalComments = await prisma.comment.count();

    // Count total shares (if you have shares table)
    const totalShares = await prisma.share?.count() || 0;

    // Count active users (updated in last 7 days - using updatedAt as proxy for activity)
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Count new users today
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    // Count posts today
    const postsToday = await prisma.post.count({
      where: {
        createdAt: {
          gte: today
        },
        status: 'published'
      }
    });

    // Calculate engagement rate (likes + comments) / posts
    const engagementRate = totalPosts > 0 ? 
      ((totalLikes + totalComments) / totalPosts * 100).toFixed(1) : 0;

    // Calculate growth rate (simplified - new users this week vs last week)
    const lastWeekStart = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const [newUsersThisWeek, newUsersLastWeek] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastWeekStart,
            lt: lastWeekEnd
          }
        }
      })
    ]);

    const growthRate = newUsersLastWeek > 0 ? 
      ((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        totalLikes,
        totalComments,
        totalShares,
        activeUsers,
        newUsersToday,
        postsToday,
        engagementRate: parseFloat(engagementRate),
        growthRate: parseFloat(growthRate)
      }
    });
  } catch (error) {
    console.error('Platform statistics error:', error);
    res.status(500).json({ error: error.message });
  }
};
