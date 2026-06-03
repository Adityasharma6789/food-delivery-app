import { getDbMode } from '../utils/db.js';
import { jsonDb } from '../utils/dbStore.js';
import Restaurant from '../models/Restaurant.js';

// @desc    Fetch all restaurants
// @route   GET /api/restaurants
// @access  Public
export const getRestaurants = async (req, res, next) => {
  try {
    let restaurants;
    if (getDbMode()) {
      restaurants = jsonDb.find('restaurants');
    } else {
      restaurants = await Restaurant.find({});
    }
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
export const createRestaurant = async (req, res, next) => {
  const { name, cuisine, image, rating, time } = req.body;

  try {
    const restaurantData = {
      name,
      cuisine,
      image: image || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=400',
      rating: Number(rating) || 4.5,
      time: time || '25-35 mins'
    };

    let newRestaurant;
    if (getDbMode()) {
      // Check if exists
      const exists = jsonDb.findOne('restaurants', { name });
      if (exists) {
        res.status(400);
        throw new Error('Restaurant already exists');
      }
      newRestaurant = jsonDb.create('restaurants', restaurantData);
    } else {
      const exists = await Restaurant.findOne({ name });
      if (exists) {
        res.status(400);
        throw new Error('Restaurant already exists');
      }
      newRestaurant = await Restaurant.create(restaurantData);
    }

    res.status(201).json(newRestaurant);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
export const deleteRestaurant = async (req, res, next) => {
  const { id } = req.params;

  try {
    let success = false;
    if (getDbMode()) {
      success = jsonDb.delete('restaurants', id);
    } else {
      const result = await Restaurant.findByIdAndDelete(id);
      success = !!result;
    }

    if (success) {
      res.json({ message: 'Restaurant deleted successfully' });
    } else {
      res.status(404);
      throw new Error('Restaurant not found');
    }
  } catch (error) {
    next(error);
  }
};
