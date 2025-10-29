import prisma from '../utils/prisma.js';
import { transformPostImage } from '../utils/cloudinaryTransform.js';

export class PostRepository {
  async findMany(where, skip, limit) {
    try {
      const posts = await prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
              comments: true, 
              likes: true 
            } 
          },
        },
      });

      return posts.map(post => ({
        ...post,
        image: post.image ? transformPostImage(post.image) : null
      }));
    } catch (error) {
      console.error('PostRepository.findMany error:', error);
      throw error;
    }
  }

  async findBySlug(slug) {
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
        author: { 
          select: { 
            id: true, 
            name: true, 
            username: true, 
            avatar: true 
          } 
        },
        comments: {
          include: {
            user: { 
              select: { 
                id: true, 
                name: true, 
                username: true, 
                avatar: true 
              } 
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: { 
          select: { 
            likes: true, 
            comments: true 
          } 
        },
      },
    });

    if (post) {
      return {
        ...post,
        image: post.image ? transformPostImage(post.image) : null
      };
    }
    return null;
  }

  async findById(id) {
    const post = await prisma.post.findUnique({
      where: { id },
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
            comments: true, 
            likes: true 
          } 
        },
      },
    });

    if (post) {
      return {
        ...post,
        image: post.image ? transformPostImage(post.image) : null
      };
    }
    return null;
  }

  async findUserLike(postId, userId) {
    return await prisma.like.findUnique({
      where: { 
        postId_userId: { 
          postId, 
          userId 
        } 
      }
    });
  }

  async count(where) {
    try {
      return await prisma.post.count({ where });
    } catch (error) {
      console.error('PostRepository.count error:', error);
      throw error;
    }
  }

  async findRelatedPosts(postId, category, limit = 4) {
    const posts = await prisma.post.findMany({
      where: {
        id: { not: postId },
        category,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return posts.map(post => ({
      ...post,
      image: post.image ? transformPostImage(post.image) : null
    }));
  }

  async incrementViewCount(postId) {
    return await prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } }
    });
  }

  async getInteractionStats(postId) {
    const [likesCount, commentsCount, sharesCount, savesCount] = await Promise.all([
      prisma.like.count({ where: { postId } }),
      prisma.comment.count({ where: { postId } }),
      prisma.share.count({ where: { postId } }),
      prisma.savedPost.count({ where: { postId } })
    ]);

    return {
      likesCount,
      commentsCount,
      sharesCount,
      savesCount
    };
  }
}

export default new PostRepository();
