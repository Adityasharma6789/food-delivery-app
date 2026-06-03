import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  foods: [],
  loading: false,
  error: null,
  selectedCategory: '',
  searchText: ''
};

const foodSlice = createSlice({
  name: 'foods',
  initialState,
  reducers: {
    fetchFoodsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFoodsSuccess: (state, action) => {
      state.loading = false;
      state.foods = action.payload;
    },
    fetchFoodsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearch: (state, action) => {
      state.searchText = action.payload;
    }
  }
});

export const {
  fetchFoodsStart,
  fetchFoodsSuccess,
  fetchFoodsFail,
  setCategory,
  setSearch
} = foodSlice.actions;

export default foodSlice.reducer;
