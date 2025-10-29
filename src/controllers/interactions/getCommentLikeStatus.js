import prisma from '../../utils/prisma.js';

// Validate UUID format
const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Get like status and count for a comment
export const getCommentLikeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
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

    // Count total likes
    const likesCount = await prisma.commentLike.count({
      where: { commentId: id }
    });

    // Check if current user liked (if authenticated)
    let liked = false;
    if (req.user && req.user.userId) {
      const userLike = await prisma.commentLike.findUnique({
        where: {
          commentId_userId: {
            commentId: id,
            userId: req.user.userId
          }
        }
      });
      liked = !!userLike;
    }

    res.status(200).json({
      liked: liked,
      likesCount: likesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
