import prisma from '../../utils/prisma.js';
import { transformPostImage } from '../../utils/cloudinaryTransform.js';

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.userId; // Optional auth
    
    const post = await prisma.post.findUnique({
      where: { slug },
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
    
    // Check if user has liked this post
    let userInteraction = null;
    if (userId) {
      const userLike = await prisma.like.findUnique({
        where: { postId_userId: { postId: post.id, userId } }
      });
      
      userInteraction = {
        hasLiked: !!userLike
      };
    }
    
    // Transform image if exists
    const transformedPost = {
      ...post,
      image: post.image ? transformPostImage(post.image) : null,
      userInteraction
    };
    
    res.json(transformedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get post' });
  }
};
