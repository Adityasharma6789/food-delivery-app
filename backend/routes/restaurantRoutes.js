import express from 'express';
import {
  getRestaurants,
  createRestaurant,
  deleteRestaurant
} from '../controllers/restaurantController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getRestaurants)
  .post(protect, admin, createRestaurant);

router.route('/:id')
  .delete(protect, admin, deleteRestaurant);

export default router;
