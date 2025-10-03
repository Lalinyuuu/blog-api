import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { 
  initDatabase, 
  getAllPosts, 
  getPostById, 
  createPost, 
  updatePost, 
  deletePost 
} from './db.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase().catch(console.error);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Blog API with Neon PostgreSQL',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      posts: 'GET /api/posts',
      post: 'GET /api/posts/:id',
      createPost: 'POST /api/posts',
      updatePost: 'PUT /api/posts/:id',
      deletePost: 'DELETE /api/posts/:id'
    }
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const posts = await getAllPosts();
    res.json({ 
      status: 'ok',
      database: 'connected',
      postsCount: posts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await getAllPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    
    if (!title || !content || !author) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'content', 'author']
      });
    }
    
    const newPost = await createPost({ title, content, author });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    
    if (!title || !content || !author) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'content', 'author']
      });
    }
    
    const updatedPost = await updatePost(req.params.id, { title, content, author });
    
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const deletedPost = await deletePost(req.params.id);
    
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ 
      message: 'Post deleted successfully',
      post: deletedPost 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path
  });
});

export default app;
