import analyticsService from '../../services/analyticsService.js';

// Thin controllers - HTTP handling only
export const getPostStatistics = async (req, res) => {
  try {
    const { postId } = req.params;
    const stats = await analyticsService.getPostStatisticsById(postId);
    
    res.json({
      success: true,
      data: {
        postId,
        ...stats
      }
    });
  } catch (error) {
    console.error('=== Get Post Statistics Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getMultiplePostsStatistics = async (req, res) => {
  try {
    const { postIds } = req.body;
    const stats = await analyticsService.getMultiplePostsStatistics(postIds);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    if (error.message === 'Post IDs array is required') {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    
    console.error('=== Get Multiple Posts Statistics Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserStatistics = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await analyticsService.getUserStatisticsById(userId);
    
    res.json({
      success: true,
      data: {
        userId,
        ...stats
      }
    });
  } catch (error) {
    console.error('=== Get User Statistics Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};