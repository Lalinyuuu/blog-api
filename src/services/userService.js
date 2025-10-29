import userRepository from '../repositories/userRepository.js';

export class UserService {
  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getUserPosts(userId, page = 1, limit = 6) {
    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
      userRepository.findPostsByUserId(userId, skip, limit),
      userRepository.countPostsByUserId(userId)
    ]);
    
    return {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getUserStatistics(userId) {
    // ตรวจสอบว่า user มีอยู่หรือไม่
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const [
      postsCount,
      totalLikesReceived,
      totalCommentsReceived,
      totalSavesReceived,
      totalSharesReceived,
      followersCount,
      followingCount
    ] = await Promise.all([
      userRepository.countPostsByUserId(userId),
      userRepository.countLikesReceived(userId),
      userRepository.countCommentsReceived(userId),
      userRepository.countSavesReceived(userId),
      userRepository.countSharesReceived(userId),
      userRepository.countFollowers(userId),
      userRepository.countFollowing(userId)
    ]);

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username
      },
      postsCount,
      totalLikesReceived,
      totalCommentsReceived,
      totalSavesReceived,
      totalSharesReceived,
      followersCount,
      followingCount
    };
  }

  async checkEmailExists(email) {
    const user = await userRepository.findUserByEmail(email);
    return !!user;
  }

  async checkUsernameExists(username) {
    const user = await userRepository.findUserByUsername(username);
    return !!user;
  }

  async validatePassword(password) {
    if (!password) {
      return { isValid: false, error: 'Password required' };
    }
    
    if (password.length < 8) {
      return { isValid: false, error: 'Password too short' };
    }
    
    return { isValid: true };
  }
}

export default new UserService();
