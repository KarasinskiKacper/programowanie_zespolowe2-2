import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { selectSelectedCategoryId, selectCategories } from "@/store/slices/categoriesSlice";

export type Auction = {
  categories: string[];
  current_price: number;
  description: string;
  end_date: string;
  id_auction: number;
  id_seller: number;
  id_winner: number | null;
  main_photo: string | null;
  overtime: number;
  start_date: string;
  start_price: number;
  status: string;
  title: string;
};

type AuctionsState = {
  items: Auction[];
  search: string;
};

const initialState: AuctionsState = {
  items: [],
  search: "",
};

export const auctionsSlice = createSlice({
  name: "auctions",
  initialState,
  reducers: {
    /**
     * Sets the list of auctions in the state.
     * @param {state} The state of the application.
     * @param {action} The action containing the list of auctions to set.
     */
    setAuctions(state, action: PayloadAction<Auction[]>) {
      state.items = action.payload;
    },
    /**
     * Sets the search string in the state.
     * @param {state} The state of the application.
     * @param {action} The action containing the search string to set.
     */
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
  },
});

export const { setAuctions, setSearch } = auctionsSlice.actions;
export default auctionsSlice.reducer;

export const selectAllAuctions = (state: { auctions: AuctionsState }) => state.auctions.items;

export const selectUnsoldAuctions = createSelector([selectAllAuctions], (items) =>
  items.filter((a) => a.status !== "sold"),
);

export const selectSearch = (state: { auctions: AuctionsState }) => state.auctions.search;

export const selectFilteredAuctionsBySearch = createSelector(
  [selectAllAuctions, selectSearch],
  (items, search) => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((a) => (a.title ?? "").toLowerCase().includes(q));
  },
);

export const selectUnsoldFilteredAuctionsBySearch = createSelector(
  [selectUnsoldAuctions, selectSearch],
  (items, search) => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((a) => (a.title ?? "").toLowerCase().includes(q));
  },
);

export const selectUnsoldFilteredAuctionsBySearchAndCategory = createSelector(
  [selectUnsoldFilteredAuctionsBySearch, selectSelectedCategoryId, selectCategories],
  (items, selectedCategoryId, categories) => {
    if (selectedCategoryId == null) return items;

    const selectedCategoryName = categories.find(
      (c) => c.id_category === selectedCategoryId,
    )?.category_name;

    if (!selectedCategoryName) return items;

    return items.filter((a) => (a.categories ?? []).includes(selectedCategoryName));
  },
);