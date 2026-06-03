import { createSlice } from '@reduxjs/toolkit';

const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const promoFromStorage = localStorage.getItem('promoCode')
  ? JSON.parse(localStorage.getItem('promoCode'))
  : null;

const initialState = {
  cartItems: cartItemsFromStorage,
  promoCode: promoFromStorage ? promoFromStorage.code : null,
  promoDiscountPercentage: promoFromStorage ? promoFromStorage.discount : 0
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find(x => x._id === item._id || x.id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map(x =>
          (x._id === existItem._id) ? { ...x, qty: x.qty + (item.qty || 1) } : x
        );
      } else {
        state.cartItems.push({ ...item, qty: item.qty || 1 });
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.cartItems = state.cartItems.filter(x => x._id !== id && x.id !== id);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    updateQuantity: (state, action) => {
      const { id, qty } = action.payload;
      state.cartItems = state.cartItems.map(x =>
        (x._id === id || x.id === id) ? { ...x, qty: Number(qty) } : x
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    applyPromo: (state, action) => {
      const code = action.payload.toUpperCase();
      if (code === 'SWIFT20') {
        state.promoCode = 'SWIFT20';
        state.promoDiscountPercentage = 20; // 20% Discount
        localStorage.setItem('promoCode', JSON.stringify({ code: 'SWIFT20', discount: 20 }));
      }
    },
    removePromo: (state) => {
      state.promoCode = null;
      state.promoDiscountPercentage = 0;
      localStorage.removeItem('promoCode');
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.promoCode = null;
      state.promoDiscountPercentage = 0;
      localStorage.removeItem('cartItems');
      localStorage.removeItem('promoCode');
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyPromo,
  removePromo,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
