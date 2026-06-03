import { createSlice } from '@reduxjs/toolkit';

const wishlistFromStorage = localStorage.getItem('wishlistItems')
  ? JSON.parse(localStorage.getItem('wishlistItems'))
  : [];

const initialState = {
  wishlistItems: wishlistFromStorage
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const item = action.payload;
      const existItem = state.wishlistItems.find(x => x._id === item._id || x.id === item._id);

      if (existItem) {
        // Remove from wishlist
        state.wishlistItems = state.wishlistItems.filter(x => x._id !== item._id && x.id !== item._id);
      } else {
        // Add to wishlist
        state.wishlistItems.push(item);
      }
      localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
    },
    clearWishlist: (state) => {
      state.wishlistItems = [];
      localStorage.removeItem('wishlistItems');
    }
  }
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
