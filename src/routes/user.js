import express from 'express';
import { 
  getUserProfile, 
  getUserPosts, 
  getUserStatistics 
} from '../controllers/users/userController.js';
import { getUserSuggestions } from '../controllers/users/userSuggestionsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.get('/suggestions', (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
}, getUserSuggestions);

router.get('/:userId', getUserProfile);
router.get('/:userId/posts', getUserPosts);
router.get('/:userId/statistics', getUserStatistics);

export default router;
