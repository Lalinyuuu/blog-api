import prisma from '../../utils/prisma.js';

// Validate UUID format
const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Validate comment ID
    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid comment id' });
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { 
        id: true, 
        content: true, 
        userId: true,
        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: id,
          userId: userId
        }
      }
    });

    if (existingLike) {
      // Return like status instead of error (idempotent behavior)
      const likesCount = await prisma.commentLike.count({
        where: { commentId: id }
      });
      
      return res.status(200).json({
        liked: true,
        likesCount: likesCount
      });
    }

    // Add like
    await prisma.commentLike.create({
      data: {
        commentId: id,
        userId: userId
      }
    });

    // Count likes
    const likesCount = await prisma.commentLike.count({
      where: { commentId: id }
    });

    // Create notification for comment owner (if not self)
    if (comment.userId !== userId) {
      try {
        // Get the user's name for the notification
        const liker = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true }
        });

        await prisma.notification.create({
          data: {
            userId: comment.userId,
            type: 'comment.liked',
            commentId: id,
            postId: comment.post.id,
            fromUserId: userId,
            message: liker?.name ? `${liker.name} liked your comment` : 'Someone liked your comment'
          }
        });
      } catch (notificationError) {
        // Notification creation failed, but like was successful
      }
    }

    res.status(200).json({
      liked: true,
      likesCount: likesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unlike a comment
export const unlikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Validate comment ID
    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid comment id' });
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if like exists
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: id,
          userId: userId
        }
      }
    });

    if (!existingLike) {
      return res.status(404).json({ error: 'Like not found' });
    }

    // Remove like
    await prisma.commentLike.delete({
      where: {
        commentId_userId: {
          commentId: id,
          userId: userId
        }
      }
    });

    // Count likes
    const likesCount = await prisma.commentLike.count({
      where: { commentId: id }
    });

    res.status(200).json({
      liked: false,
      likesCount: likesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
