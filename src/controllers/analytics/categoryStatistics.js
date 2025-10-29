import prisma from '../../utils/prisma.js';

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
