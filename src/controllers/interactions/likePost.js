import prisma from '../../utils/prisma.js';

// Like/Unlike Posts
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // ตรวจสอบว่า post มีอยู่หรือไม่
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // ตรวจสอบว่า user เคย like แล้วหรือยัง
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

    // เพิ่ม like
    const like = await prisma.like.create({
      data: {
        postId: postId,
        userId: userId
      }
    });

    // นับจำนวน likes ใหม่
    const likesCount = await prisma.like.count({
      where: { postId: postId }
    });

    // สร้าง notification สำหรับ author (ถ้าไม่ใช่ตัวเอง)
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
        console.error('Failed to create notification:', notificationError);
      }
    }

    res.json({
      success: true,
      message: 'Post liked successfully',
      isLiked: true,
      likesCount: likesCount
    });
  } catch (error) {
    console.error('=== Like Post Error ===', error);
    res.status(500).json({ error: error.message });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // ตรวจสอบว่า user เคย like แล้วหรือยัง
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

    // ลบ like
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    // นับจำนวน likes ใหม่
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
    console.error('=== Unlike Post Error ===', error);
    res.status(500).json({ error: error.message });
  }
};
