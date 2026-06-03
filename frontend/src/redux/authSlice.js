import { createSlice } from '@reduxjs/toolkit';

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    authFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.userInfo = null;
      state.error = null;
      localStorage.removeItem('userInfo');
    },
    updateAddressSuccess: (state, action) => {
      if (state.userInfo) {
        state.userInfo.address = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  }
});

export const {
  authStart,
  authSuccess,
  authFail,
  logout,
  updateAddressSuccess,
  clearAuthError
} = authSlice.actions;

export default authSlice.reducer;
