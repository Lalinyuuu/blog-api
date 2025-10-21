import prisma from '../../utils/prisma.js';
import { transformPostImage } from '../../utils/cloudinaryTransform.js';

export const listPosts = async (req, res) => {
  try {
    const page  = parseInt(req.query.page ?? 1, 10);
    const limit = parseInt(req.query.limit ?? 10, 10);
    const search = req.query.search?.trim();

    const where = {};
    if (req.query.status)  where.status   = req.query.status;
    if (req.query.category) where.category = req.query.category;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
        include: {
          author: { select: { id: true, name: true, username: true, avatar: true } },
          categoryRelation: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const transformedPosts = posts.map(post => ({
      ...post,
      image: post.image ? transformPostImage(post.image) : null
    }));

    res.json({
      posts: transformedPosts,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      total,
      search: search || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list posts' });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { likes: true, comments: true } },
      },
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get post' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const isNumericId = /^\d+$/.test(id);
    const whereById = isNumericId ? { id: Number(id) } : { id };

    let post = await prisma.post.findUnique({
      where: whereById,
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post && isNumericId) {
      post = await prisma.post.findUnique({
        where: { id: id },
        include: {
          author: { select: { id: true, name: true, username: true, avatar: true } },
          comments: {
            include: {
              user: { select: { id: true, name: true, username: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: { select: { likes: true, comments: true } },
        },
      });
    }

    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get post' });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page ?? 1, 10);
    const limit = parseInt(req.query.limit ?? 20, 10);
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, username: true, avatar: true }
          }
        }
      }),
      prisma.comment.count({ where: { postId: id } })
    ]);

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get comments' });
  }
};

export const getPostInteractionStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const [likesCount, commentsCount] = await Promise.all([
      prisma.like.count({ where: { postId: id } }),
      prisma.comment.count({ where: { postId: id } })
    ]);

    let userInteraction = null;
    if (userId) {
      const userLike = await prisma.like.findUnique({
        where: { postId_userId: { postId: id, userId } }
      });

      userInteraction = {
        hasLiked: !!userLike
      };
    }

    res.json({
      likesCount,
      commentsCount,
      userInteraction
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get interaction stats' });
  }
};

export const getRelatedPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit ?? 3, 10);

    const currentPost = await prisma.post.findUnique({
      where: { id },
      select: { categoryId: true, category: true, id: true }
    });

    if (!currentPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const relatedPosts = await prisma.post.findMany({
      where: {
        AND: [
          { 
            OR: [
              { categoryId: currentPost.categoryId },
              { category: currentPost.category }
            ]
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
    res.status(500).json({ error: 'Failed to get related posts' });
  }
};