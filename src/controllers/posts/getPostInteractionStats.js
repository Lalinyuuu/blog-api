import prisma from '../../utils/prisma.js';

export const getPostInteractionStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const [likesCount, commentsCount] = await Promise.all([
      prisma.like.count({ where: { postId: id } }),
      prisma.comment.count({ where: { postId: id } })
    ]);

    let userInteraction = null;
    if (userId) {
      const userLike = await prisma.like.findUnique({
        where: { postId_userId: { postId: id, userId } }
      });

      userInteraction = {
        hasLiked: !!userLike
      };
    }

    res.json({
      likesCount,
      commentsCount,
      userInteraction
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get interaction stats' });
  }
};
