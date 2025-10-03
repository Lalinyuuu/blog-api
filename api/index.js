import express from 'express';
import cors from 'cors';
import prisma from './prisma.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Blog API with Prisma + Neon',
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

app.get('/api/health', async (req, res) => {
  try {
    const postsCount = await prisma.post.count();
    res.json({ 
      status: 'ok',
      database: 'connected',
      postsCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const { published } = req.query;
    const posts = await prisma.post.findMany({
      where: published ? { published: published === 'true' } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id }
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author, published } = req.body;
    if (!title || !content || !author) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'content', 'author']
      });
    }
    const newPost = await prisma.post.create({
      data: { title, content, author, published: published || false }
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, content, author, published } = req.body;
    const updatedPost = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(author && { author }),
        ...(published !== undefined && { published })
      }
    });
    res.json(updatedPost);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const deletedPost = await prisma.post.delete({
      where: { id: req.params.id }
    });
    res.json({ 
      message: 'Post deleted successfully',
      post: deletedPost 
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path
  });
});

export default app;
