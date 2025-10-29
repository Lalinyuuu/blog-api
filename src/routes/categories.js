import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import prisma from '../utils/prisma.js';
import { 
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryPosts,
  getCategoryById
} from '../controllers/admin/categoryController.js';

const router = express.Router();

// GET /api/admin/categories - ดึงรายการ categories ทั้งหมด
router.get('/', authenticate, requireAdmin, getAllCategories);

// Test endpoint without auth for debugging
router.get('/test', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// GET /api/admin/categories/:id - ดึงข้อมูล category เดียว
router.get('/:id', authenticate, requireAdmin, getCategoryById);

// POST /api/admin/categories - สร้าง category ใหม่
router.post('/', authenticate, requireAdmin, createCategory);

// PUT /api/admin/categories/:id - แก้ไขชื่อ category
router.put('/:id', authenticate, requireAdmin, updateCategory);

// DELETE /api/admin/categories/:id - ลบ category
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

// GET /api/admin/categories/:id/posts - ดึง posts ที่ใช้ category นี้
router.get('/:id/posts', authenticate, requireAdmin, getCategoryPosts);

export default router;
