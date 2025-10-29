import prisma from '../../utils/prisma.js';

// Save/Unsave Posts
export const savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // ตรวจสอบว่า post มีอยู่หรือไม่
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, authorId: true }
    });

    if (!post) {
      console.error('Post not found:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }

    // ตรวจสอบว่า user เคย save แล้วหรือยัง
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    if (existingSave) {
      console.error('Post already saved:', postId);
      return res.status(400).json({ error: 'Post already saved' });
    }

    // เพิ่ม save
    const savedPost = await prisma.savedPost.create({
      data: {
        postId: postId,
        userId: userId
      }
    });

    res.json({
      success: true,
      message: 'Post saved successfully',
      isSaved: true,
      savedPostId: savedPost.id
    });
  } catch (error) {
    console.error('=== Save Post Error ===', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};

export const unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // ตรวจสอบว่า user เคย save แล้วหรือยัง
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    if (!existingSave) {
      console.error('Post not saved yet:', postId);
      return res.status(400).json({ error: 'Post not saved yet' });
    }

    // ลบ save
    await prisma.savedPost.delete({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    res.json({
      success: true,
      message: 'Post unsaved successfully',
      isSaved: false
    });
  } catch (error) {
    console.error('=== Unsave Post Error ===', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};
