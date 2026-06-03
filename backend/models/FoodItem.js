import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  restaurant: {
    type: String,
    required: true,
    default: "SwiftBite Kitchen"
  },
  rating: {
    type: Number,
    required: true,
    default: 4.5
  },
  isVeg: {
    type: Boolean,
    required: true,
    default: false
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
export default FoodItem;
