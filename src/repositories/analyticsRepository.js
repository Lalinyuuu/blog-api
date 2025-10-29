import prisma from '../utils/prisma.js';

export class AnalyticsRepository {
  async getPlatformStatistics() {
    const [totalUsers, totalPosts, totalComments, totalLikes] = await Promise.all([
      prisma.user.count(),
      prisma.post.count({ where: { status: 'published' } }),
      prisma.comment.count(),
      prisma.like.count()
    ]);

    return {
      totalUsers,
      totalPosts,
      totalComments,
      totalLikes
    };
  }

  async getCategoryStatistics() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: { status: 'published' }
            }
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      }
    });

    return categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      postCount: category._count.posts
    }));
  }

  async getUserStatistics() {
    const [totalUsers, activeUsers, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          posts: {
            some: {
              status: 'published'
            }
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth
    };
  }

  async getPostStatistics() {
    const [totalPosts, publishedPosts, draftPosts, totalViews] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'published' } }),
      prisma.post.count({ where: { status: 'draft' } }),
      prisma.post.aggregate({
        _sum: { viewCount: true }
      })
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: totalViews._sum.viewCount || 0
    };
  }

  async getEngagementStatistics() {
    const [totalLikes, totalComments, totalShares, totalSaves] = await Promise.all([
      prisma.like.count(),
      prisma.comment.count(),
      prisma.share.count(),
      prisma.savedPost.count()
    ]);

    return {
      totalLikes,
      totalComments,
      totalShares,
      totalSaves
    };
  }

  async getTimeBasedStatistics() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [postsLast30Days, postsLast7Days, usersLast30Days, usersLast7Days] = await Promise.all([
      prisma.post.count({
        where: {
          createdAt: { gte: last30Days },
          status: 'published'
        }
      }),
      prisma.post.count({
        where: {
          createdAt: { gte: last7Days },
          status: 'published'
        }
      }),
      prisma.user.count({
        where: { createdAt: { gte: last30Days } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: last7Days } }
      })
    ]);

    return {
      postsLast30Days,
      postsLast7Days,
      usersLast30Days,
      usersLast7Days
    };
  }

  async getPostStatisticsById(postId) {
    const [likesCount, commentsCount, sharesCount, savesCount, viewCount] = await Promise.all([
      prisma.like.count({ where: { postId } }),
      prisma.comment.count({ where: { postId } }),
      prisma.share.count({ where: { postId } }),
      prisma.savedPost.count({ where: { postId } }),
      prisma.post.findUnique({
        where: { id: postId },
        select: { viewCount: true }
      })
    ]);

    return {
      likesCount,
      commentsCount,
      sharesCount,
      savesCount,
      viewCount: viewCount?.viewCount || 0
    };
  }

  async getMultiplePostsStatistics(postIds) {
    const [likesCount, commentsCount, sharesCount, savesCount] = await Promise.all([
      prisma.like.count({ where: { postId: { in: postIds } } }),
      prisma.comment.count({ where: { postId: { in: postIds } } }),
      prisma.share.count({ where: { postId: { in: postIds } } }),
      prisma.savedPost.count({ where: { postId: { in: postIds } } })
    ]);

    return {
      totalLikes: likesCount,
      totalComments: commentsCount,
      totalShares: sharesCount,
      totalSaves: savesCount
    };
  }

  async getUserStatisticsById(userId) {
    const [postsCount, likesReceived, commentsReceived, followersCount] = await Promise.all([
      prisma.post.count({
        where: { authorId: userId, status: 'published' }
      }),
      prisma.like.count({
        where: { post: { authorId: userId } }
      }),
      prisma.comment.count({
        where: { post: { authorId: userId } }
      }),
      prisma.follow.count({
        where: { followingId: userId }
      })
    ]);

    return {
      postsCount,
      likesReceived,
      commentsReceived,
      followersCount
    };
  }
}

export default new AnalyticsRepository();
