import prisma from '../../utils/prisma.js';

// Like a post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    // Add like
    const like = await prisma.like.create({
      data: {
        postId: postId,
        userId: userId
      }
    });

    // Count new likes
    const likesCount = await prisma.like.count({
      where: { postId: postId }
    });

    // Create notification for author (if not self)
    if (post.authorId !== userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'like',
            postId: postId,
            fromUserId: userId,
            message: `${req.user.name} liked your post "${post.title}"`
          }
        });
      } catch (notificationError) {
        // Notification creation failed, but like was successful
      }
    }

    res.json({
      success: true,
      message: 'Post liked successfully',
      isLiked: true,
      likesCount: likesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unlike a post
export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Check if user already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    if (!existingLike) {
      return res.status(400).json({ error: 'Post not liked yet' });
    }

    // Remove like
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    // Count new likes
    const likesCount = await prisma.like.count({
      where: { postId: postId }
    });

    res.json({
      success: true,
      message: 'Post unliked successfully',
      isLiked: false,
      likesCount: likesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check if user liked a post
export const checkLikeStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const like = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    res.json({
      success: true,
      isLiked: !!like
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get likes for a post
export const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const [likes, totalCount] = await Promise.all([
      prisma.like.findMany({
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
        skip,
        take: limit
      }),
      prisma.like.count({
        where: { postId: postId }
      })
    ]);

    res.json({
      success: true,
      data: {
        likes: likes.map(like => ({
          id: like.id,
          user: like.user,
          likedAt: like.createdAt
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
