import prisma from '../../utils/prisma.js';

// Check follow status
export const checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        isFollowing: !!follow,
        followedAt: follow?.createdAt || null
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get followers of a user
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

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

    // Get followers
    const [followers, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              bio: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.follow.count({
        where: { followingId: userId }
      })
    ]);

    // Check if current user is following each follower
    const followersWithFollowStatus = await Promise.all(
      followers.map(async (follow) => {
        const isFollowing = currentUserId !== follow.follower.id ? 
          await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: follow.follower.id
              }
            }
          }) : null;

        return {
          ...follow.follower,
          followedAt: follow.createdAt,
          isFollowing: !!isFollowing
        };
      })
    );

    res.json({
      success: true,
      data: {
        followers: followersWithFollowStatus,
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

// Get users that a user is following
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

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

    // Get following
    const [following, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              bio: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.follow.count({
        where: { followerId: userId }
      })
    ]);

    // Check if current user is following each user
    const followingWithFollowStatus = await Promise.all(
      following.map(async (follow) => {
        const isFollowing = currentUserId !== follow.following.id ? 
          await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: follow.following.id
              }
            }
          }) : null;

        return {
          ...follow.following,
          followedAt: follow.createdAt,
          isFollowing: !!isFollowing
        };
      })
    );

    res.json({
      success: true,
      data: {
        following: followingWithFollowStatus,
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
