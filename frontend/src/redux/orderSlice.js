import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    orderStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    orderCreateSuccess: (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
      state.orders.unshift(action.payload);
    },
    orderDetailSuccess: (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
    },
    orderListSuccess: (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    },
    orderFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateOrderStatusSuccess: (state, action) => {
      state.loading = false;
      const updatedOrder = action.payload;
      if (state.currentOrder && (state.currentOrder._id === updatedOrder._id || state.currentOrder.id === updatedOrder.id)) {
        state.currentOrder = updatedOrder;
      }
      state.orders = state.orders.map(order =>
        (order._id === updatedOrder._id || order.id === updatedOrder.id) ? updatedOrder : order
      );
    },
    clearOrderError: (state) => {
      state.error = null;
    }
  }
});

export const {
  orderStart,
  orderCreateSuccess,
  orderDetailSuccess,
  orderListSuccess,
  orderFail,
  updateOrderStatusSuccess,
  clearOrderError
} = orderSlice.actions;

export default orderSlice.reducer;
