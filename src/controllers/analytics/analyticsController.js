import analyticsService from '../../services/analyticsService.js';

// Thin controllers - HTTP handling only
export const getPlatformStatistics = async (req, res) => {
  try {
    const stats = await analyticsService.getPlatformStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('=== Get Platform Statistics Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getCategoryStatistics = async (req, res) => {
  try {
    const stats = await analyticsService.getCategoryStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('=== Get Category Statistics Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserStatisticsGeneral = async (req, res) => {
  try {
    // Import the function directly to get topUsers data
    const { getUserStatisticsGeneral: getUserStats } = await import('./userStatistics.js');
    return await getUserStats(req, res);
  } catch (error) {
    console.error('=== Get User Statistics Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getPostStatisticsGeneral = async (req, res) => {
  try {
    // Import the function directly to get topPosts data
    const { getPostStatisticsGeneral: getPostStats } = await import('./postStatistics.js');
    return await getPostStats(req, res);
  } catch (error) {
    console.error('=== Get Post Statistics Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getEngagementStatistics = async (req, res) => {
  try {
    const stats = await analyticsService.getEngagementStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('=== Get Engagement Statistics Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getTimeBasedStatistics = async (req, res) => {
  try {
    const stats = await analyticsService.getTimeBasedStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('=== Get Time Based Statistics Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};
