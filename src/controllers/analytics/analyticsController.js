import prisma from '../../utils/prisma.js';

// Get Overall Platform Statistics
export const getPlatformStatistics = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await prisma.user.count();

    // Count total posts
    const totalPosts = await prisma.post.count();

    // Count published posts
    const publishedPosts = await prisma.post.count({
      where: { status: 'published' }
    });

    // Count total likes
    const totalLikes = await prisma.like.count();

    // Count total comments
    const totalComments = await prisma.comment.count();

    // Count total follows
    const totalFollows = await prisma.follow.count();

    // Get most popular posts
    const popularPosts = await prisma.post.findMany({
      where: { status: 'published' },
      include: {
        author: {
          select: { id: true, name: true, username: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: {
        likes: { _count: 'desc' }
      },
      take: 10
    });

    // Get most active users
    const activeUsers = await prisma.user.findMany({
      include: {
        _count: {
          select: { posts: true, followers: true }
        }
      },
      orderBy: {
        posts: { _count: 'desc' }
      },
      take: 10
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        publishedPosts,
        totalLikes,
        totalComments,
        totalFollows,
        popularPosts: popularPosts.map(post => ({
          id: post.id,
          title: post.title,
          author: post.author,
          likesCount: post._count.likes,
          commentsCount: post._count.comments
        })),
        activeUsers: activeUsers.map(user => ({
          id: user.id,
          name: user.name,
          username: user.username,
          postsCount: user._count.posts,
          followersCount: user._count.followers
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Category Statistics
export const getCategoryStatistics = async (req, res) => {
  try {
    // Get all categories with post counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: {
        posts: { _count: 'desc' }
      }
    });

    // Get posts by category
    const postsByCategory = await prisma.post.groupBy({
      by: ['category'],
      where: { status: 'published' },
      _count: {
        category: true
      },
      orderBy: {
        _count: { category: 'desc' }
      }
    });

    res.json({
      success: true,
      data: {
        categories: categories.map(category => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          postsCount: category._count.posts
        })),
        postsByCategory: postsByCategory.map(item => ({
          category: item.category,
          count: item._count.category
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
