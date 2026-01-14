import { createSlice } from "@reduxjs/toolkit";

const initialState: { access_token: string | null; user: string | null; isAuthenticated: boolean } =
  {
    access_token: null,
    user: null,
    isAuthenticated: false,
  };

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      console.log("slice", action.payload);

      state.access_token = action.payload.access_token;
      state.user = action.payload.access_token;
      state.isAuthenticated = true;
    },
    logout: (state, action) => {
      state.access_token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
