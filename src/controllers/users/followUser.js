import prisma from '../../utils/prisma.js';

// Follow a user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    // Check if trying to follow self
    if (followerId === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot follow yourself'
      });
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        error: 'Already following this user'
      });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId: userId
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Create notification for the followed user
    await prisma.notification.create({
      data: {
        userId,
        type: 'follow',
        fromUserId: followerId,
        message: `${req.user.name} started following you`
      }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully followed user',
      data: {
        followId: follow.id,
        followerId: follow.followerId,
        followingId: follow.followingId,
        following: follow.following,
        createdAt: follow.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    // Check if follow relationship exists
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    if (!follow) {
      return res.status(400).json({
        success: false,
        error: 'Not following this user'
      });
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully unfollowed user'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
