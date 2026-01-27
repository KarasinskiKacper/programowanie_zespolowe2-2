import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import authReducer from "./slices/authSlice.ts";
import auctionsReducer from "./slices/auctionSlice";
import userAuctionsReducer from "./slices/userAuctionSlice";
// import usersRepoReducer from "./slices/usersRepoSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // usersRepo: usersRepoReducer,
    auctions: auctionsReducer,
    userAuctions: userAuctionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
