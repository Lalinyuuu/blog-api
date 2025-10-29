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
        select: {
          id: true,
          title: true,
          content: true,
          description: true,
          image: true,
          slug: true,
          category: true,
          tags: true,
          status: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
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
