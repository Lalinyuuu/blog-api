import postService from '../../services/postService.js';

// Thin controllers - HTTP handling only
export const listPosts = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      status: req.query.status,
      category: req.query.category
    };

    const result = await postService.listPosts(filters);
    res.json(result);
  } catch (error) {
    console.error('=== List Posts Error ===', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.userId || null;
    
    const post = await postService.getPostBySlug(slug, userId);
    res.json({
      success: true,
      post
    });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }
    
    console.error('=== Get Post By Slug Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || null;
    
    const post = await postService.getPostById(id, userId);
    res.json({
      success: true,
      post
    });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }
    
    console.error('=== Get Post By ID Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { id } = req.params; // Changed from postId to id to match route parameter
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user?.userId || null;
    
    const result = await postService.getPostComments(id, parseInt(page), parseInt(limit), userId);
    res.json(result);
  } catch (error) {
    console.error('=== Get Post Comments Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getPostInteractionStats = async (req, res) => {
  try {
    const { postId } = req.params;
    const stats = await postService.getPostInteractionStats(postId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('=== Get Post Interaction Stats Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getRelatedPosts = async (req, res) => {
  try {
    const { postId } = req.params;
    const { category } = req.query;
    const { limit = 4 } = req.query;
    
    if (!category) {
      return res.status(400).json({ 
        success: false,
        error: 'Category is required' 
      });
    }
    
    const posts = await postService.getRelatedPosts(postId, category, parseInt(limit));
    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('=== Get Related Posts Error ===', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};