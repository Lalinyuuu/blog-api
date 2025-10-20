import prisma from '../../utils/prisma.js';

// Add Comment
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Add comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: postId,
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // Count new comments
    const commentsCount = await prisma.comment.count({
      where: { postId: postId }
    });

    // Create notification for author (if not self)
    if (post.authorId !== userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'comment',
            postId: postId,
            fromUserId: userId,
            message: `${req.user.name} commented on your post "${post.title}"`
          }
        });
      } catch (notificationError) {
        // Notification creation failed, but comment was successful
      }
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: comment,
      commentsCount: commentsCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Comments
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = await prisma.comment.findMany({
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
      skip: skip,
      take: parseInt(limit)
    });

    const total = await prisma.comment.count({
      where: { postId: postId }
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

// Update Comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Check if comment exists and user owns it
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        userId: userId
      },
      include: {
        post: {
          select: { id: true, title: true }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    // Check if comment exists and user owns it
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        userId: userId
      },
      include: {
        post: {
          select: { id: true, title: true }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id: commentId }
    });

    // Count new comments
    const commentsCount = await prisma.comment.count({
      where: { postId: comment.postId }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      commentsCount: commentsCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};