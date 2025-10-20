import prisma from '../../utils/prisma.js';

// Like a post
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId
        }
      }
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Already liked' });
    }

    const like = await prisma.like.create({
      data: { postId: id, userId }
    });

    // Create notification if not post owner
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'like',
          postId: id,
          fromUserId: userId
        }
      });
    }

    res.json(like);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unlike a post
export const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: id,
          userId
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create comment on post
export const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
        userId
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Create notification for post author
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'comment',
          postId: id,
          fromUserId: userId,
          message: `มี comment ใหม่ในบทความ: ${post.title}`
        }
      });
    }

    // Create notifications for previous commenters
    const previousCommenters = await prisma.comment.findMany({
      where: { 
        postId: id,
        userId: { 
          not: userId,
          not: post.authorId 
        }
      },
      select: { userId: true },
      distinct: ['userId']
    });

    if (previousCommenters.length > 0) {
      const notifications = previousCommenters.map(commenter => ({
        userId: commenter.userId,
        type: 'new_comment',
        postId: id,
        fromUserId: userId,
        message: `มี comment ใหม่ในบทความ: ${post.title}`
      }));

      await prisma.notification.createMany({
        data: notifications
      });
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await prisma.comment.findFirst({
      where: { 
        id: commentId, 
        postId, 
        userId 
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true }
        }
      }
    });

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.userId;

    const comment = await prisma.comment.findFirst({
      where: { 
        id: commentId, 
        postId, 
        userId 
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Share post
export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform } = req.body; // 'facebook', 'twitter', 'linkedin', etc.
    const userId = req.user.userId;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Create share URL
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/posts/${post.slug}`;
    
    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`,
      line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`
    };

    res.json({
      success: true,
      shareUrl,
      platformLinks: shareLinks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
