import prisma from '../../utils/prisma.js';

export const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page ?? 1, 10);
    const limit = parseInt(req.query.limit ?? 20, 10);
    const skip = (page - 1) * limit;
    const userId = req.user?.userId; // Optional auth

    // Get top-level comments (parentId is null)
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { 
          postId: id,
          parentId: null // Only get top-level comments
        },
        include: {
          user: {
            select: { id: true, name: true, username: true, avatar: true }
          },
          replies: {
            include: {
              user: {
                select: { id: true, name: true, username: true, avatar: true }
              },
              replies: {
                include: {
                  user: {
                    select: { id: true, name: true, username: true, avatar: true }
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
        skip,
        take: limit
      }),
      prisma.comment.count({ 
        where: { 
          postId: id,
          parentId: null // Only count top-level comments
        } 
      })
    ]);

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

    res.json({
      success: true,
      data: {
        comments: formattedComments,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          pages: Math.max(1, Math.ceil(total / limit))
        }
      }
    });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get comments',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
