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
    /**
     * Sets the list of auctions owned by the current user
     * @param {MyAuctionsState} state - The state of the user's auctions
     * @param {PayloadAction<Auction[]>} action - The action containing the list of auctions to set
     */
    setOwnAuctions(state, action: PayloadAction<Auction[]>) {
      state.own = action.payload;
    },
    /**
     * Sets the list of auctions the current user is participating in
     * @param {MyAuctionsState} state - The state of the user's auctions
     * @param {PayloadAction<Auction[]>} action - The action containing the list of auctions to set
     */
    setParticipatingAuctions(state, action: PayloadAction<Auction[]>) {
      state.participating = action.payload;
    },
    /**
     * Sets the list of archived auctions the current user is participating in
     * @param {MyAuctionsState} state - The state of the user's auctions
     * @param {PayloadAction<Auction[]>} action - The action containing the list of auctions to set
     */
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
