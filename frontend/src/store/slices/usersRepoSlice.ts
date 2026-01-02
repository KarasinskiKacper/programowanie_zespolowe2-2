import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

type User = {
	id: string;
	name: string;
	surname: string;
	email: string;
};

const initialState: { users: Map<string,User> } = {
	users: new Map<string,User>(),
};

export const usersRepoSlice = createSlice({
	name: "usersRepo",
	initialState,
	reducers: {
		register: (state, action) => {
			state.users.set(action.payload.id, action.payload);
		},
	},
});


export const selectUser = (state: { usersRepo: { users: Map<string,User> } }, userId: string) => {
	return state.usersRepo.users.get(userId) || null;
};

export const selectClient = (state: RootState) => {
	if (!state.auth.user) return null;

	return state.usersRepo.users.get(state.auth.user) || null;
};


export const { register } = usersRepoSlice.actions;
export default usersRepoSlice.reducer;
