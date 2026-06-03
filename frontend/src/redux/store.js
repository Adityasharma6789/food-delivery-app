import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import cartReducer from './cartSlice.js';
import foodReducer from './foodSlice.js';
import orderReducer from './orderSlice.js';
import wishlistReducer from './wishlistSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    foods: foodReducer,
    orders: orderReducer,
    wishlist: wishlistReducer
  }
});

export default store;
