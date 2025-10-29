import prisma from '../../utils/prisma.js';

// Get Comments
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?.userId; // Optional auth

    // Debug: console.log('📖 Get Comments Request:', { postId, page });

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get top-level comments (parentId is null)
    const comments = await prisma.comment.findMany({
      where: { 
        postId: postId,
        parentId: null // Only get top-level comments
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
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            },
            replies: {
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
              },
              orderBy: { createdAt: 'asc' }
            },
            _count: {
              select: { likes: true }
            }
          },
          orderBy: { createdAt: 'asc' } // Show replies in chronological order
        },
        _count: {
          select: { likes: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: parseInt(limit)
    });

    // Get all comment IDs (including replies and nested replies) for like checking
    const allCommentIds = [];
    comments.forEach(comment => {
      allCommentIds.push(comment.id);
      comment.replies.forEach(reply => {
        allCommentIds.push(reply.id);
        // Add nested replies
        if (reply.replies) {
          reply.replies.forEach(nestedReply => {
            allCommentIds.push(nestedReply.id);
          });
        }
      });
    });

    // Get user's likes for these comments (if authenticated)
    let userLikes = [];
    if (userId && allCommentIds.length > 0) {
      userLikes = await prisma.commentLike.findMany({
        where: {
          userId: userId,
          commentId: { in: allCommentIds }
        },
        select: { commentId: true }
      });
    }

    const userLikedCommentIds = new Set(userLikes.map(l => l.commentId));

    // Format comments with like info and replies
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      userId: comment.userId,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
      liked: userLikedCommentIds.has(comment.id),
      likesCount: comment._count.likes,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        postId: reply.postId,
        userId: reply.userId,
        parentId: reply.parentId,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        user: reply.user,
        liked: userLikedCommentIds.has(reply.id),
        likesCount: reply._count.likes,
        replies: reply.replies ? reply.replies.map(nestedReply => ({
          id: nestedReply.id,
          content: nestedReply.content,
          postId: nestedReply.postId,
          userId: nestedReply.userId,
          parentId: nestedReply.parentId,
          createdAt: nestedReply.createdAt,
          updatedAt: nestedReply.updatedAt,
          user: nestedReply.user,
          liked: userLikedCommentIds.has(nestedReply.id),
          likesCount: nestedReply._count.likes
        })) : []
      }))
    }));

    // Count only top-level comments for pagination
    const total = await prisma.comment.count({
      where: { 
        postId: postId,
        parentId: null
      }
    });

    res.json({
      success: true,
      data: {
        comments: formattedComments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get comments',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
