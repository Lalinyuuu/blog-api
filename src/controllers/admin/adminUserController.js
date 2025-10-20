import prisma from '../../utils/prisma.js';

// Get All Users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;


    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: parseInt(limit)
    });

    const total = await prisma.user.count();


    res.json({
      success: true,
      data: {
        users: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
('=== Get All Users Error ===', error);
('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};

// Update User Role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { role } = req.body;


    if (!role || !['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be user, admin, or moderator'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, role: true }
    });

    if (!user) {
('User not found:', userId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });


    res.json({
      success: true,
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
('=== Update User Role Error ===', error);
('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};

// Delete User (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id: userId } = req.params;


    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, role: true }
    });

    if (!user) {
('User not found:', userId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // ไม่ให้ลบ admin คนอื่น
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete admin user'
      });
    }

    // ลบ user และข้อมูลที่เกี่ยวข้อง (CASCADE)
    await prisma.user.delete({
      where: { id: userId }
    });


    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
('=== Delete User Error ===', error);
('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};
