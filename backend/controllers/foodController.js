import { getDbMode } from '../utils/db.js';
import { jsonDb } from '../utils/dbStore.js';
import FoodItem from '../models/FoodItem.js';
import Order from '../models/Order.js';

// @desc    Fetch all food items
// @route   GET /api/foods
// @access  Public
export const getFoods = async (req, res, next) => {
  const { category, search } = req.query;

  try {
    let foods;
    if (getDbMode()) {
      foods = jsonDb.find('foods');
      if (category) {
        foods = foods.filter(f => f.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        foods = foods.filter(f =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.description.toLowerCase().includes(search.toLowerCase())
        );
      }
    } else {
      const filter = {};
      if (category) {
        filter.category = category;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      foods = await FoodItem.find(filter);
    }
    res.json(foods);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single food item by ID
// @route   GET /api/foods/:id
// @access  Public
export const getFoodById = async (req, res, next) => {
  const { id } = req.params;

  try {
    let food;
    if (getDbMode()) {
      food = jsonDb.findById('foods', id);
    } else {
      food = await FoodItem.findById(id);
    }

    if (food) {
      res.json(food);
    } else {
      res.status(404);
      throw new Error('Food item not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a food item (Admin)
// @route   POST /api/foods
// @access  Private/Admin
export const createFood = async (req, res, next) => {
  const { name, description, price, image, category, rating, isVeg, restaurant } = req.body;

  try {
    const foodData = {
      name,
      description,
      price: Number(price),
      image,
      category,
      restaurant: restaurant || "Burger Bistro", // Default value
      rating: Number(rating) || 4.5,
      isVeg: isVeg || false,
      isAvailable: true
    };

    let newFood;
    if (getDbMode()) {
      newFood = jsonDb.create('foods', foodData);
    } else {
      newFood = await FoodItem.create(foodData);
    }

    res.status(201).json(newFood);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a food item (Admin)
// @route   PUT /api/foods/:id
// @access  Private/Admin
export const updateFood = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, image, category, isVeg, restaurant } = req.body;

  try {
    const updateData = {
      name,
      description,
      price: Number(price),
      image,
      category,
      restaurant,
      isVeg: isVeg || false
    };

    let updatedFood;
    if (getDbMode()) {
      updatedFood = jsonDb.findByIdAndUpdate('foods', id, updateData);
    } else {
      updatedFood = await FoodItem.findByIdAndUpdate(id, updateData, { new: true });
    }

    if (updatedFood) {
      res.json(updatedFood);
    } else {
      res.status(404);
      throw new Error('Food item not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a food item (Admin)
// @route   DELETE /api/foods/:id
// @access  Private/Admin
export const deleteFood = async (req, res, next) => {
  const { id } = req.params;

  try {
    let success = false;
    if (getDbMode()) {
      success = jsonDb.delete('foods', id);
    } else {
      const result = await FoodItem.findByIdAndDelete(id);
      success = !!result;
    }

    if (success) {
      res.json({ message: 'Food item deleted successfully' });
    } else {
      res.status(404);
      throw new Error('Food item not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended food items based on user preferences and order history
// @route   GET /api/foods/recommendations
// @access  Private
export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let orders = [];

    // 1. Fetch user orders
    if (getDbMode()) {
      orders = jsonDb.find('orders', { user: userId });
    } else {
      orders = await Order.find({ user: userId });
    }

    // 2. Fetch all food items
    let allFoods = [];
    if (getDbMode()) {
      allFoods = jsonDb.find('foods');
    } else {
      allFoods = await FoodItem.find({});
    }

    // If no orders yet, recommend top rated foods as fallback
    if (orders.length === 0) {
      const topRated = allFoods
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
      return res.json(topRated);
    }

    // 3. Analyze order history
    const orderedFoodIds = new Set();
    const categoryCounts = {};
    let vegOrderCount = 0;
    let totalItemsCount = 0;

    orders.forEach(order => {
      order.orderItems?.forEach(item => {
        orderedFoodIds.add(item.foodItem?.toString());
        totalItemsCount++;

        // Find category of this item in database
        const foodMatch = allFoods.find(f => f.name === item.name || f._id?.toString() === item.foodItem?.toString() || f.id?.toString() === item.foodItem?.toString());
        if (foodMatch) {
          categoryCounts[foodMatch.category] = (categoryCounts[foodMatch.category] || 0) + 1;
          if (foodMatch.isVeg) {
            vegOrderCount++;
          }
        }
      });
    });

    // Determine favorite categories (sorted by frequency)
    const favoriteCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);
    
    // Determine user preference (Veg if > 80% of ordered items are Veg)
    const prefersVeg = totalItemsCount > 0 ? (vegOrderCount / totalItemsCount) >= 0.8 : false;

    // 4. Generate recommendations list
    let recommendations = [];

    // Prioritize items in favorite categories that user hasn't ordered yet
    recommendations = allFoods.filter(food => {
      const foodIdStr = (food._id || food.id)?.toString();
      const isAlreadyOrdered = orderedFoodIds.has(foodIdStr);
      const isInFavCategory = favoriteCategories.includes(food.category);
      const satisfiesVegPref = prefersVeg ? food.isVeg : true;

      return !isAlreadyOrdered && isInFavCategory && satisfiesVegPref;
    });

    // Sort by food rating
    recommendations.sort((a, b) => b.rating - a.rating);

    // If we don't have enough recommendations, relax the 'not already ordered' rule or add general popular items
    if (recommendations.length < 4) {
      const fallbackItems = allFoods.filter(food => {
        const foodIdStr = (food._id || food.id)?.toString();
        const satisfiesVegPref = prefersVeg ? food.isVeg : true;
        return satisfiesVegPref && !recommendations.some(r => (r._id || r.id)?.toString() === foodIdStr);
      });
      // Sort fallback items by rating and append
      fallbackItems.sort((a, b) => b.rating - a.rating);
      recommendations = [...recommendations, ...fallbackItems];
    }

    // Limit to 5 recommendations
    res.json(recommendations.slice(0, 5));
  } catch (error) {
    next(error);
  }
};
