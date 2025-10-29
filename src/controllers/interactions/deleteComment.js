import prisma from '../../utils/prisma.js';

// Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;
    
    console.log('🔍 [deleteComment] User info:', {
      userId: req.user.userId,
      role: req.user.role,
      email: req.user.email
    });

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
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
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
