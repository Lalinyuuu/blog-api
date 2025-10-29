import prisma from '../../utils/prisma.js';
import { transformPostImage } from '../../utils/cloudinaryTransform.js';

export const getRelatedPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit ?? 3, 10);

    const currentPost = await prisma.post.findUnique({
      where: { id },
      select: { 
        categoryId: true, 
        category: true, 
        id: true,
        categoryRelation: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!currentPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Build category filter - prioritize categoryRelation.id (from Category table)
    const categoryFilter = [];
    
    // First priority: Use categoryRelation.id (from Category table)
    if (currentPost.categoryRelation?.id) {
      categoryFilter.push({ categoryId: currentPost.categoryRelation.id });
    }
    
    // Second priority: Use categoryId if available
    if (currentPost.categoryId) {
      categoryFilter.push({ categoryId: currentPost.categoryId });
    }
    
    // Third priority: Use category string (deprecated field)
    if (currentPost.category) {
      categoryFilter.push({ category: currentPost.category });
    }
    
    // Also try categoryRelation name as fallback
    if (currentPost.categoryRelation?.name) {
      categoryFilter.push({ category: currentPost.categoryRelation.name });
    }

    // If no category filter can be built, return empty results instead of error
    if (categoryFilter.length === 0) {
      return res.json({
        success: true,
        posts: [],
        data: []
      });
    }

    const relatedPosts = await prisma.post.findMany({
      where: {
        AND: [
          { 
            OR: categoryFilter
          },
          { id: { not: id } },
          { status: 'published' }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        image: true,
        description: true,
        category: true,
        createdAt: true,
        author: { 
          select: { 
            id: true,
            name: true,
            username: true,
            avatar: true
          } 
        },
        categoryRelation: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const transformedPosts = relatedPosts.map(post => ({
      ...post,
      image: post.image ? transformPostImage(post.image) : null
    }));

    res.json({
      success: true,
      posts: transformedPosts,
      data: transformedPosts
    });
  } catch (error) {
    console.error('Get related posts error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get related posts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

