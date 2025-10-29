import prisma from '../utils/prisma.js';

export class UserRepository {
  async findById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: {
              where: { status: 'published' }
            },
            followers: true,
            following: true
          }
        }
      }
    });
  }

  async findPostsByUserId(userId, skip, limit) {
    return await prisma.post.findMany({
      where: { 
        authorId: userId,
        status: 'published'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
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
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
            savedPosts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
  }

  async countPostsByUserId(userId) {
    return await prisma.post.count({
      where: { 
        authorId: userId,
        status: 'published'
      }
    });
  }

  async countLikesReceived(userId) {
    return await prisma.like.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });
  }

  async countCommentsReceived(userId) {
    return await prisma.comment.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });
  }

  async countSavesReceived(userId) {
    return await prisma.savedPost.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });
  }

  async countSharesReceived(userId) {
    return await prisma.share.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });
  }

  async countFollowers(userId) {
    return await prisma.follow.count({
      where: { followingId: userId }
    });
  }

  async countFollowing(userId) {
    return await prisma.follow.count({
      where: { followerId: userId }
    });
  }

  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async findUserByUsername(username) {
    return await prisma.user.findUnique({
      where: { username }
    });
  }

  async createUser(userData) {
    return await prisma.user.create({
      data: userData
    });
  }

  async updateUser(userId, userData) {
    return await prisma.user.update({
      where: { id: userId },
      data: userData
    });
  }
}

export default new UserRepository();
