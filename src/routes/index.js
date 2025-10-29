import express from 'express';
import authRoutes from './auth.js';
import postRoutes from './posts.js';
import adminRoutes from './admin.js';
import notificationRoutes from './notification.js';
import categoryRoutes from './categories.js';
import publicCategoryRoutes from './publicCategories.js';
import uploadRoutes from './upload.js';
import followRoutes from './follow.js';
import interactionRoutes from './interactions.js';
import commentRoutes from './comments.js';
import statisticsRoutes from './statistics.js';
import userRoutes from './user.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes); 
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin/categories', categoryRoutes);
router.use('/categories', publicCategoryRoutes); // Public categories endpoint
router.use('/upload', uploadRoutes);
router.use('/follow', followRoutes);
router.use('/interactions', interactionRoutes);
router.use('/comments', commentRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/users', userRoutes);

export default router;