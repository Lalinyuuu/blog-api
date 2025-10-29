import postRepository from '../repositories/postRepository.js';
import prisma from '../utils/prisma.js';

export class PostService {
  async listPosts(filters = {}) {
    try {
      const { page = 1, limit = 10, search, status, category } = filters;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const takeLimit = parseInt(limit);
      
      const where = {};
      if (status) where.status = status;
      if (category) where.category = category;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [posts, total] = await Promise.all([
        postRepository.findMany(where, skip, takeLimit),
        postRepository.count(where)
      ]);

      return {
        success: true,
        posts,
        pagination: {
          page: parseInt(page),
          limit: takeLimit,
          total,
          totalPages: Math.ceil(total / takeLimit)
        }
      };
    } catch (error) {
      console.error('🔴 [PostService.listPosts] Error:', error);
      throw error;
    }
  }

  async getPostBySlug(slug, userId = null) {
    const post = await postRepository.findBySlug(slug);
    if (!post) {
      throw new Error('Post not found');
    }

    let userInteraction = null;
    if (userId) {
      const userLike = await postRepository.findUserLike(post.id, userId);
      userInteraction = { hasLiked: !!userLike };
    }

    return {
      ...post,
      userInteraction
    };
  }

  async getPostById(id, userId = null) {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }

    let userInteraction = null;
    if (userId) {
      const userLike = await postRepository.findUserLike(post.id, userId);
      userInteraction = { hasLiked: !!userLike };
    } else {
      userInteraction = { hasLiked: false };
    }

    return {
      ...post,
      userInteraction
    };
  }

  async getRelatedPosts(postId, category, limit = 4) {
    return await postRepository.findRelatedPosts(postId, category, limit);
  }

  async getPostInteractionStats(postId) {
    return await postRepository.getInteractionStats(postId);
  }

  async incrementViewCount(postId) {
    return await postRepository.incrementViewCount(postId);
  }

  async getPostComments(postId, page = 1, limit = 20, userId = null) {
    const skip = (page - 1) * limit;
    
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true
            }
          },
          _count: {
            select: {
              likes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.comment.count({ where: { postId } })
    ]);

    // Add user interaction status for each comment
    const commentsWithInteraction = await Promise.all(
      comments.map(async (comment) => {
        let liked = false;
        if (userId) {
          const userLike = await prisma.commentLike.findUnique({
            where: {
              commentId_userId: {
                commentId: comment.id,
                userId: userId
              }
            }
          });
          liked = !!userLike;
        }

        return {
          ...comment,
          liked,
          likesCount: comment._count.likes
        };
      })
    );

    return {
      success: true,
      comments: commentsWithInteraction,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }
}

export default new PostService();
