import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Auction } from "@/store/slices/auctionSlice";

type MyAuctionsState = {
  own: Auction[];
  participating: Auction[];
  archived: Auction[];
};

const initialState: MyAuctionsState = {
  own: [],
  participating: [],
  archived: [],
};

const userAuctionsSlice = createSlice({
  name: "myAuctions",
  initialState,
  reducers: {
    setOwnAuctions(state, action: PayloadAction<Auction[]>) {
      state.own = action.payload;
    },
    setParticipatingAuctions(state, action: PayloadAction<Auction[]>) {
      state.participating = action.payload;
    },
    setArchivedAuctions(state, action: PayloadAction<Auction[]>) {
      state.archived = action.payload;
    },
  },
});

export const { setOwnAuctions, setParticipatingAuctions, setArchivedAuctions } =
  userAuctionsSlice.actions;

export default userAuctionsSlice.reducer;

export const selectOwnAuctions = (state: any) => state.userAuctions.own;
export const selectParticipatingAuctions = (state: any) => state.userAuctions.participating;
export const selectArchivedAuctions = (state: any) => state.userAuctions.archived;
