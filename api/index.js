import express from 'express';
import cors from 'cors';
import prisma from './prisma.js';
import authRouter from './auth/index.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);


app.get('/api', (req, res) => {
  res.json({ message: 'Ragnarok Blog API', version: '1.0.0' });
});


app.get('/api/health', async (req, res) => {
  try {
    const count = await prisma.post.count();
    res.json({ status: 'ok', postsCount: count });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const { published, page = 1, limit = 10, keyword = '' } = req.query;
    
    const where = {};
    if (published) where.published = published === 'true';
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } }
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
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

export default app;