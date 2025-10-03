app.get('/api/posts', async (req, res) => {
    try {
      const { published, page = 1, limit = 10, keyword = '' } = req.query;
      
      const where = {
        ...(published && { published: published === 'true' }),
        ...(keyword && {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { content: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } }
          ]
        })
      };
  
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