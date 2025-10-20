import prisma from '../../utils/prisma.js';

// Get Post Statistics
export const getPostStatistics = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Count likes
    const likesCount = await prisma.like.count({
      where: { postId: postId }
    });

    // Count comments
    const commentsCount = await prisma.comment.count({
      where: { postId: postId }
    });

    // Count saves
    const savesCount = await prisma.savedPost.count({
      where: { postId: postId }
    });

    // Count shares
    const sharesCount = await prisma.share.count({
      where: { postId: postId }
    });

    // Count shares by platform
    const sharesByPlatform = await prisma.share.groupBy({
      by: ['platform'],
      where: { postId: postId },
      _count: {
        platform: true
      }
    });

    res.json({
      success: true,
      data: {
        postId: postId,
        postTitle: post.title,
        likesCount: likesCount,
        commentsCount: commentsCount,
        savesCount: savesCount,
        sharesCount: sharesCount,
        sharesByPlatform: sharesByPlatform.map(item => ({
          platform: item.platform,
          count: item._count.platform
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Multiple Posts Statistics
export const getMultiplePostsStatistics = async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ error: 'PostIds array is required' });
    }

    // Check if posts exist
    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: { id: true, title: true }
    });

    if (posts.length === 0) {
      return res.status(404).json({ error: 'No posts found' });
    }

    // Count likes for all posts
    const likesCounts = await prisma.like.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds } },
      _count: {
        postId: true
      }
    });

    // Count comments for all posts
    const commentsCounts = await prisma.comment.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds } },
      _count: {
        postId: true
      }
    });

    // Count saves for all posts
    const savesCounts = await prisma.savedPost.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds } },
      _count: {
        postId: true
      }
    });

    // Count shares for all posts
    const sharesCounts = await prisma.share.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds } },
      _count: {
        postId: true
      }
    });

    // Combine statistics
    const statistics = posts.map(post => {
      const likesCount = likesCounts.find(item => item.postId === post.id)?._count.postId || 0;
      const commentsCount = commentsCounts.find(item => item.postId === post.id)?._count.postId || 0;
      const savesCount = savesCounts.find(item => item.postId === post.id)?._count.postId || 0;
      const sharesCount = sharesCounts.find(item => item.postId === post.id)?._count.postId || 0;

      return {
        postId: post.id,
        postTitle: post.title,
        likesCount: likesCount,
        commentsCount: commentsCount,
        savesCount: savesCount,
        sharesCount: sharesCount
      };
    });

    res.json({
      success: true,
      data: {
        statistics: statistics,
        totalPosts: posts.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Statistics
export const getUserStatistics = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Count posts
    const postsCount = await prisma.post.count({
      where: { authorId: userId }
    });

    // Count total likes received
    const totalLikesReceived = await prisma.like.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });

    // Count total comments received
    const totalCommentsReceived = await prisma.comment.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });

    // Count total saves received
    const totalSavesReceived = await prisma.savedPost.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });

    // Count total shares received
    const totalSharesReceived = await prisma.share.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });

    // Count followers
    const followersCount = await prisma.follow.count({
      where: { followingId: userId }
    });

    // Count following
    const followingCount = await prisma.follow.count({
      where: { followerId: userId }
    });

    res.json({
      success: true,
      data: {
        userId: userId,
        userName: user.name,
        username: user.username,
        postsCount: postsCount,
        totalLikesReceived: totalLikesReceived,
        totalCommentsReceived: totalCommentsReceived,
        totalSavesReceived: totalSavesReceived,
        totalSharesReceived: totalSharesReceived,
        followersCount: followersCount,
        followingCount: followingCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};