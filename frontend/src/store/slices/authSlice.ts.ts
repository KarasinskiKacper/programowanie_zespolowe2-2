import { createSlice } from "@reduxjs/toolkit";

const initialState: { token: string | null; user: string | null; isAuthenticated: boolean } = {
	token: null,
	user: null,
	isAuthenticated: false,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		login: (state, action) => {
			state.token = action.payload.token;
			state.user = action.payload.user;
			state.isAuthenticated = true;
		},
		logout: (state, action) => {
			state.token = null;
			state.user = null;
			state.isAuthenticated = false;
		},
	},
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
