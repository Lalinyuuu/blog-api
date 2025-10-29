import prisma from '../../utils/prisma.js';

// Get Post Statistics (General)
export const getPostStatisticsGeneral = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Count total posts
    const totalPosts = await prisma.post.count({
      where: { status: 'published' }
    });

    // Count posts today
    const postsToday = await prisma.post.count({
      where: {
        createdAt: { gte: today },
        status: 'published'
      }
    });

    // Count total likes
    const totalLikes = await prisma.like.count();

    // Count total comments
    const totalComments = await prisma.comment.count();

    // Count total shares
    const totalShares = await prisma.share?.count() || 0;

    // Count total views (if you have viewCount field)
    const totalViews = await prisma.post.aggregate({
      where: { status: 'published' },
      _sum: { viewCount: true }
    });

    // Calculate average engagement
    const avgEngagement = totalPosts > 0 ? 
      ((totalLikes + totalComments) / totalPosts).toFixed(1) : 0;

    // Get top posts
    const topPosts = await prisma.post.findMany({
      where: { status: 'published' },
      select: {
        title: true,
        _count: {
          select: { likes: true, comments: true, shares: true }
        },
        viewCount: true
      },
      orderBy: {
        likes: { _count: 'desc' }
      },
      take: 3
    });

    // Get posts by category
    const postCategories = await prisma.post.groupBy({
      by: ['categoryId'],
      where: { status: 'published' },
      _count: { categoryId: true }
    });

    // Get category names
    const categories = await prisma.category.findMany({
      select: { id: true, name: true }
    });

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });

    const postCategoriesWithNames = postCategories.map(item => {
      const categoryName = categoryMap[item.categoryId] || 'Uncategorized';
      const percentage = totalPosts > 0 ? 
        ((item._count.categoryId / totalPosts) * 100).toFixed(1) : 0;
      
      return {
        category: categoryName,
        count: item._count.categoryId,
        percentage: parseFloat(percentage)
      };
    }).sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        totalPosts,
        postsToday,
        totalLikes,
        totalComments,
        totalShares,
        totalViews: totalViews._sum.viewCount || 0,
        avgEngagement: parseFloat(avgEngagement),
        topPosts: topPosts.map(post => ({
          title: post.title,
          likes: post._count.likes,
          comments: post._count.comments,
          shares: post._count.shares || 0,
          views: post.viewCount || 0
        })),
        postCategories: postCategoriesWithNames
      }
    });
  } catch (error) {
    console.error('Post statistics error:', error);
    res.status(500).json({ error: error.message });
  }
};
