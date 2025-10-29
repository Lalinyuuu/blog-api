import prisma from '../../utils/prisma.js';

// Add Comment
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    let { content, parentId } = req.body;
    const userId = req.user?.userId;

    // Check authentication
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Handle case where frontend sends comment object instead of string
    if (content && typeof content === 'object' && content.content) {
      content = content.content;
    }

    // Validate content exists and is string
    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Comment content must be a string' });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: 'Comment is too long (max 5000 characters)' });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, authorId: true, status: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Optional: Check if post is published
    if (post.status !== 'published') {
      return res.status(403).json({ error: 'Cannot comment on unpublished posts' });
    }

    // If parentId is provided, validate that the parent comment exists and belongs to the same post
    if (parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: {
          id: parentId,
          postId: postId
        },
        select: { id: true, userId: true }
      });

      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found or does not belong to this post' });
      }
    }

    // Add comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: postId,
        userId: userId,
        parentId: parentId || null
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
        parent: parentId ? {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          }
        } : false,
        _count: {
          select: { likes: true }
        }
      }
    });

    // Count new comments (only top-level comments for the main count)
    const commentsCount = await prisma.comment.count({
      where: { 
        postId: postId,
        parentId: null // Only count top-level comments
      }
    });

    // Format comment with like info
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      userId: comment.userId,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
      parent: comment.parent || null,
      liked: false, // New comment, not liked yet
      likesCount: 0, // New comment, no likes yet
      replies: [] // New comment, no replies yet
    };

    // Create notification for post author (if not self and not a reply)
    if (post.authorId !== userId && !parentId) {
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

    // Create notification for parent comment author (if replying to someone else)
    if (parentId && comment.parent && comment.parent.user.id !== userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: comment.parent.user.id,
            type: 'comment_reply',
            postId: postId,
            commentId: parentId,
            fromUserId: userId,
            message: `${req.user.name} replied to your comment`
          }
        });
      } catch (notificationError) {
        // Notification creation failed, but comment was successful
      }
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: formattedComment,
      commentsCount: commentsCount
    });
  } catch (error) {
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid post or user reference' });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Related record not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to add comment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
