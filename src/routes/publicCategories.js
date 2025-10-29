import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

// GET /api/categories - Public endpoint (no auth required)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          _count: {
            select: { 
              posts: {
                where: { status: 'published' } // Count only published posts
              }
            }
          }
        }
      }),
      prisma.category.count()
    ]);

    // Format response with postsCount
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      postsCount: cat._count.posts
    }));

    res.json({
      success: true,
      categories: formattedCategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// GET /api/categories/:slug - Get category by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: { 
            posts: {
              where: { status: 'published' }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        postsCount: category._count.posts
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get category' });
  }
});

// GET /api/categories/:slug/posts - Get posts by category slug (public)
router.get('/:slug/posts', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find category
    const category = await prisma.category.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, description: true }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get published posts only
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { 
          categoryId: category.id,
          status: 'published'
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          image: true,
          publishedAt: true,
          viewCount: true,
          author: { 
            select: { 
              id: true, 
              name: true, 
              username: true, 
              avatar: true 
            } 
          },
          _count: { 
            select: { 
              comments: true, 
              likes: true 
            } 
          }
        }
      }),
      prisma.post.count({ 
        where: { 
          categoryId: category.id,
          status: 'published'
        }
      })
    ]);

    res.json({
      success: true,
      category,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get category posts' });
  }
});

export default router;

