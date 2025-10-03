app.get('/api/posts', async (req, res) => {
    try {
      const { published, page = 1, limit = 10, keyword = '' } = req.query;
      
      const where = {};
      
      if (published) {
        where.published = published === 'true';
      }
      
      if (keyword) {
        where.OR = [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
          { description: { contains: keyword } }
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
      console.error('Error fetching posts:', error);
      res.status(500).json({ 
        error: 'Failed to fetch posts',
        message: error.message 
      });
    }
  });