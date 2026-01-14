import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

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

    logout: (state) => {
      state.access_token = null;
      state.user = null;
      state.isAuthenticated = false;
      Cookies.remove("access_token", { path: "/" });
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
