import prisma from '../../utils/prisma.js';

/* ---------- Utils ---------- */
function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function makeUniqueSlug(title) {
  const base = slugify(title || '');
  let slug = base || 'post';
  let i = 1;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

/* ---------- Dashboard Stats ---------- */
export const getStats = async (req, res) => {
  try {
    const [totalPosts, totalUsers, publishedPosts, draftPosts, totalComments, totalLikes] = await Promise.all([
      prisma.post.count(),
      prisma.user.count(),
      prisma.post.count({ where: { status: 'published' } }),
      prisma.post.count({ where: { status: 'draft' } }),
      prisma.comment.count(),
      prisma.like.count(),
    ]);
    res.json({ totalPosts, totalUsers, publishedPosts, draftPosts, totalComments, totalLikes });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

/* ---------- List Posts (admin table) ---------- */
export const getAllPosts = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page ?? '1', 10);
    const limit = Number.parseInt(req.query.limit ?? '20', 10);
    const status = req.query.status;
    const category = req.query.category;
    const search = req.query.search?.trim();

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    
    // เพิ่ม search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, username: true, avatar: true } },
          categoryRelation: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / Math.max(take, 1)),
      },
      search: search || null
    });
  } catch (error) {
    console.error('Admin get posts error:', error);
    res.status(500).json({ error: error.message });
  }
};

/* ---------- Get One Post (admin edit page) ---------- */
export const getPostByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    if (!p) return res.status(404).json({ error: 'Post not found' });
    res.json(p);
  } catch (error) {
    console.error('Get post (admin) error:', error);
    res.status(500).json({ error: error.message });
  }
};

/* ---------- Create Post ---------- */
export const createPost = async (req, res) => {
  try {
    const {
      title,
      description = '',
      content = '',
      category = '',
      image = '',
      imagePublicId = '',
      status = 'draft',
      bylineName,
      bylineAvatar,
      tags = [],
    } = req.body;

    // Very strict validation for title
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string' });
    }
    
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length === 0) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    
    if (trimmedTitle.length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters' });
    }
    
    // Validate content
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required and must be a string' });
    }
    
    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }
    
    if (trimmedContent.length < 10) {
      return res.status(400).json({ error: 'Content must be at least 10 characters' });
    }

    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const author = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!author) return res.status(401).json({ error: 'Invalid author' });

    const slug = await makeUniqueSlug(trimmedTitle);

    // Ensure tags is an array
    const tagsArray = Array.isArray(tags) ? tags : [];

    const post = await prisma.post.create({
      data: {
        title: trimmedTitle,
        slug,
        description: description?.trim() || '',
        content: trimmedContent,
        category,
        image,
        imagePublicId,
        status,
        tags: tagsArray,
        authorId: author.id,
        publishedAt: status === 'published' ? new Date() : null,

        bylineName: bylineName ?? author.name,
        bylineAvatar: bylineAvatar ?? author.avatar ?? null,
      },
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
      },
    });

    // สร้าง notification...
    if (status === 'published') {
      const allUsers = await prisma.user.findMany({
        where: { 
          role: { not: 'admin' },
          id: { not: author.id }
        },
        select: { id: true }
      });

      if (allUsers.length > 0) {
        const notifications = allUsers.map(user => ({
          userId: user.id,
          type: 'new_article',
          postId: post.id,
          fromUserId: author.id,
          message: `บทความใหม่: ${post.title}`
        }));

        await prisma.notification.createMany({
          data: notifications
        });
      }
    }

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: error.message });
  }
};

/* ---------- Update Post ---------- */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      content,
      description,
      category,
      status,
      image,
      bylineName,
      bylineAvatar,
      tags,
    } = req.body;

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) return res.status(404).json({ error: 'Post not found' });

    // Very strict validation for title if provided
    if (title !== undefined) {
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title must be a string' });
      }
      const trimmedTitle = title.trim();
      if (!trimmedTitle || trimmedTitle.length === 0) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      if (trimmedTitle.length < 3) {
        return res.status(400).json({ error: 'Title must be at least 3 characters' });
      }
      // Check for "Untitled Post" or similar invalid titles
      if (trimmedTitle.toLowerCase().includes('untitled') || trimmedTitle === 'Untitled Post') {
        return res.status(400).json({ error: 'Please enter a proper title for your post' });
      }
    } else {
      // If no title provided, check if existing post has valid title
      const existingTitle = existingPost.title?.trim() || '';
      if (!existingTitle || existingTitle.length < 3) {
        return res.status(400).json({ error: 'Post must have a valid title before publishing' });
      }
      // Check for "Untitled Post" or similar invalid titles
      if (existingTitle.toLowerCase().includes('untitled') || existingTitle === 'Untitled Post') {
        return res.status(400).json({ error: 'Please enter a proper title for your post' });
      }
    }
    
    // Very strict validation for content if provided
    if (content !== undefined) {
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content must be a string' });
      }
      const trimmedContent = content.trim();
      if (!trimmedContent || trimmedContent.length === 0) {
        return res.status(400).json({ error: 'Content cannot be empty' });
      }
      if (trimmedContent.length < 10) {
        return res.status(400).json({ error: 'Content must be at least 10 characters' });
      }
    }

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (content !== undefined) data.content = content.trim();
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (image !== undefined) data.image = image;
    if (bylineName !== undefined) data.bylineName = bylineName;
    if (bylineAvatar !== undefined) data.bylineAvatar = bylineAvatar;
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];

    if (status) {
      data.status = status;
      if (status === 'published' && !existingPost.publishedAt) {
        data.publishedAt = new Date();
        
        // สร้าง notification สำหรับสมาชิกทุกคนเมื่ออัพเดทบทความเป็น published
        const allUsers = await prisma.user.findMany({
          where: { 
            role: { not: 'admin' },
            id: { not: existingPost.authorId } // ไม่ส่งให้ผู้เขียนเอง
          },
          select: { id: true }
        });

        if (allUsers.length > 0) {
          const notifications = allUsers.map(user => ({
            userId: user.id,
            type: 'new_article',
            postId: id,
            fromUserId: existingPost.authorId,
            message: `บทความใหม่: ${existingPost.title}`
          }));

          await prisma.notification.createMany({
            data: notifications
          });
        }
      }
      if (status === 'draft') {

      }
    }

    const post = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
      },
    });

    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: error.message });
  }
};

/* ---------- Delete Post ---------- */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await prisma.post.delete({ where: { id } });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: error.message });
  }
};