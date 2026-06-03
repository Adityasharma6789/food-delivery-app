import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserAddress,
  getUsers,
  toggleUserRole,
  deleteUser
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile/address', protect, updateUserAddress);

// Admin user management routes
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .delete(protect, admin, deleteUser);

router.route('/:id/role')
  .put(protect, admin, toggleUserRole);

export default router;
