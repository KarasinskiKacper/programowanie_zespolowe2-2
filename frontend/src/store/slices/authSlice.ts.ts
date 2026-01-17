import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState: {
  access_token: string | null;
  isAuthenticated: boolean;
  create_account_date: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
} = {
  access_token: null,
  isAuthenticated: false,
  create_account_date: null,
  email: null,
  first_name: null,
  last_name: null,
  phone_number: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.access_token = action.payload.access_token;
      state.isAuthenticated = true;
      state.create_account_date = action.payload.create_account_date;
      state.email = action.payload.email;
      state.first_name = action.payload.first_name;
      state.last_name = action.payload.last_name;
      state.phone_number = action.payload.phone_number;
    },

    logout: (state) => {
      state.access_token = null;
      state.isAuthenticated = false;
      state.create_account_date = null;
      state.email = null;
      state.first_name = null;
      state.last_name = null;
      state.phone_number = null;
      Cookies.remove("access_token", { path: "/" });
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
