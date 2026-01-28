import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Category = {
  id_category: number;
  category_name: string;
};

type CategoriesState = {
  items: Category[];
  selectedCategoryId: number | null;
};

const initialState: CategoriesState = {
  items: [],
  selectedCategoryId: null,
};

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    /**
     * Sets the list of categories in the state.
     * @param {CategoriesState} state - The state of the categories
     * @param {PayloadAction<Category[]>} action - The action containing the list of categories to set
     */
    setCategories(state, action: PayloadAction<Category[]>) {
      state.items = action.payload;
    },
    /**
     * Sets the selected category id in the state.
     * @param {CategoriesState} state - The state of the categories
     * @param {PayloadAction<number | null>} action - The action containing the selected category id to set
     */
    setSelectedCategoryId(state, action: PayloadAction<number | null>) {
      state.selectedCategoryId = action.payload;
    },
  },
});
export const { setCategories, setSelectedCategoryId } = categoriesSlice.actions;
export default categoriesSlice.reducer;

export const selectCategories = (state: any) => state.categories.items;
export const selectSelectedCategoryId = (state: any) => state.categories.selectedCategoryId;
export const selectSelectedCategory = (state: any) => {
  const id = state.categories.selectedCategoryId;
  return state.categories.items.find((c: Category) => c.id_category === id) ?? null;
};
