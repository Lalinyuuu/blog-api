import userService from '../../services/userService.js';

// Thin controllers - HTTP handling only
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserProfile(userId);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    console.error('=== Get User Profile Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 6 } = req.query;
    
    const result = await userService.getUserPosts(userId, parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      data: {
        user: { id: userId },
        ...result
      }
    });
  } catch (error) {
    console.error('=== Get User Posts Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserStatistics = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await userService.getUserStatistics(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    console.error('=== Get User Statistics Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};