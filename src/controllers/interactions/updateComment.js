import prisma from '../../utils/prisma.js';

// Update Comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Check if comment exists
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId
      },
      include: {
        post: {
          select: { id: true, title: true }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this comment' });
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
        },
        _count: {
          select: { likes: true }
        }
      }
    });

    // Check if current user liked this comment
    const userLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: commentId,
          userId: userId
        }
      }
    });

    // Format comment with like info
    const formattedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      postId: updatedComment.postId,
      userId: updatedComment.userId,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
      user: updatedComment.user,
      liked: !!userLike,
      likesCount: updatedComment._count.likes
    };

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment: formattedComment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
