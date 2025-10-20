import prisma from '../../utils/prisma.js';

// Get User Comments
export const getUserComments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await prisma.comment.findMany({
      where: { userId: userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: parseInt(limit)
    });

    const total = await prisma.comment.count({
      where: { userId: userId }
    });

    res.json({
      success: true,
      data: {
        comments: comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Comment Statistics
export const getCommentStatistics = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Count total comments
    const totalComments = await prisma.comment.count({
      where: { postId: postId }
    });

    // Count comments by user
    const commentsByUser = await prisma.comment.groupBy({
      by: ['userId'],
      where: { postId: postId },
      _count: {
        userId: true
      },
      orderBy: {
        _count: { userId: 'desc' }
      },
      take: 10
    });

    // Get top commenters
    const topCommenters = await Promise.all(
      commentsByUser.map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.userId },
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        });

        return {
          user,
          commentsCount: item._count.userId
        };
      })
    );

    // Get recent comments
    const recentComments = await prisma.comment.findMany({
      where: { postId: postId },
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
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        postId: postId,
        postTitle: post.title,
        totalComments: totalComments,
        topCommenters: topCommenters,
        recentComments: recentComments
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Comment by ID
export const getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Comments by User
export const getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const comments = await prisma.comment.findMany({
      where: { userId: userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: parseInt(limit)
    });

    const total = await prisma.comment.count({
      where: { userId: userId }
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username
        },
        comments: comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
