import prisma from '../../utils/prisma.js';

// Get User Statistics (General)
export const getUserStatisticsGeneral = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count total users
    const totalUsers = await prisma.user.count();

    // Count new users in last 30 days
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    // Count active users (updated in last 7 days - using updatedAt as proxy for activity)
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Count inactive users (updated > 30 days ago)
    const inactiveUsers = await prisma.user.count({
      where: {
        updatedAt: { lt: thirtyDaysAgo }
      }
    });

    // Count admin users
    const adminUsers = await prisma.user.count({
      where: { role: 'admin' }
    });

    // Count regular users
    const regularUsers = await prisma.user.count({
      where: { role: 'user' }
    });

    // Get user growth over last 4 months
    const userGrowth = [];
    for (let i = 3; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const usersInMonth = await prisma.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      userGrowth.push({
        month: monthNames[monthStart.getMonth()],
        users: usersInMonth
      });
    }

    // Get top users by activity
    const topUsers = await prisma.user.findMany({
      where: { role: 'user' },
      include: {
        _count: {
          select: { 
            posts: { where: { status: 'published' } },
            followers: true
          }
        },
        posts: {
          where: { status: 'published' },
          include: {
            _count: {
              select: { likes: true }
            }
          }
        }
      },
      orderBy: {
        posts: { _count: 'desc' }
      },
      take: 3
    });

    // Calculate total likes for each user
    const topUsersWithStats = topUsers.map(user => {
      const totalLikes = user.posts.reduce((sum, post) => sum + post._count.likes, 0);
      return {
        name: user.name || user.username,
        posts: user._count.posts,
        likes: totalLikes,
        followers: user._count.followers
      };
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        newUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        regularUsers,
        userGrowth,
        topUsers: topUsersWithStats
      }
    });
  } catch (error) {
    console.error('User statistics error:', error);
    res.status(500).json({ error: error.message });
  }
};
