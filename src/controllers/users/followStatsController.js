import prisma from '../../utils/prisma.js';

// Get follow stats for a user
export const getFollowStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get follow stats
    const [followersCount, followingCount, isFollowing] = await Promise.all([
      prisma.follow.count({
        where: { followingId: userId }
      }),
      prisma.follow.count({
        where: { followerId: userId }
      }),
      currentUserId !== userId ? 
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: userId
            }
          }
        }) : null
    ]);

    res.json({
      success: true,
      data: {
        followersCount,
        followingCount,
        isFollowing: !!isFollowing
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get feed (posts from users you follow)
export const getFeed = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    // Get users that current user is following
    const followingUsers = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true }
    });

    const followingIds = followingUsers.map(f => f.followingId);

    if (followingIds.length === 0) {
      return res.json({
        success: true,
        data: {
          posts: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        }
      });
    }

    // Get posts from followed users
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: {
          authorId: { in: followingIds },
          status: 'published'
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true
            }
          },
          categoryRelation: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          likes: {
            select: { userId: true }
          },
          comments: {
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({
        where: {
          authorId: { in: followingIds },
          status: 'published'
        }
      })
    ]);

    // Format posts with additional data
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      description: post.description,
      image: post.image,
      viewCount: post.viewCount,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      createdAt: post.createdAt,
      author: {
        ...post.author,
        isFollowing: true // Since these are from followed users
      },
      category: post.categoryRelation
    }));

    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
