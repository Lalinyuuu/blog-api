import prisma from '../../utils/prisma.js';

// Helper function to create slug from name
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper function to make unique slug
const makeUniqueSlug = async (name, excludeId = null) => {
  let slug = createSlug(name);
  let counter = 1;
  
  while (true) {
    const existing = await prisma.category.findFirst({
      where: { 
        slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    });
    
    if (!existing) break;
    
    slug = `${createSlug(name)}-${counter}`;
    counter++;
  }
  
  return slug;
};

// GET /api/admin/categories - ดึงรายการ categories ทั้งหมด
export const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          _count: {
            select: { posts: true }
          }
        }
      }),
      prisma.category.count()
    ]);

    res.json({
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
('getAllCategories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

// POST /api/admin/categories - สร้าง category ใหม่
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    if (name.length > 50) {
      return res.status(400).json({ error: 'Category name must be 50 characters or less' });
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: { name: name.trim() }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    // Create unique slug
    const slug = await makeUniqueSlug(name.trim());

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null
      }
    });

    res.status(201).json(category);
  } catch (error) {
('createCategory error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// PUT /api/admin/categories/:id - แก้ไขชื่อ category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    if (name.length > 50) {
      return res.status(400).json({ error: 'Category name must be 50 characters or less' });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if new name already exists (excluding current category)
    const duplicateCategory = await prisma.category.findFirst({
      where: { 
        name: name.trim(),
        id: { not: id }
      }
    });

    if (duplicateCategory) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    // Create new slug if name changed
    const slug = existingCategory.name !== name.trim() 
      ? await makeUniqueSlug(name.trim(), id)
      : existingCategory.slug;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null
      }
    });

    res.json(updatedCategory);
  } catch (error) {
('updateCategory error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// DELETE /api/admin/categories/:id - ลบ category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has posts
    if (category._count.posts > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that has posts',
        postsCount: category._count.posts
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
('deleteCategory error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// GET /api/admin/categories/:id/posts - ดึง posts ที่ใช้ category นี้
export const getCategoryPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const where = { categoryId: id };
    if (status) where.status = status;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          author: { 
            select: { id: true, name: true, username: true, avatar: true } 
          },
          _count: { 
            select: { comments: true, likes: true, dislikes: true } 
          }
        }
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description
      },
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
('getCategoryPosts error:', error);
    res.status(500).json({ error: 'Failed to get category posts' });
  }
};

// GET /api/admin/categories/:id - ดึงข้อมูล category เดียว
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
('getCategoryById error:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
};
