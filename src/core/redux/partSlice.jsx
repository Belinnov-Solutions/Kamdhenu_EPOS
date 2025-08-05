import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  partProducts: [],
  partCategories: [],
  selectedCategory: null,
  isLoading: false,
  cartItems: [],
};

const partSlice = createSlice({
  name: "parts",
  initialState,
  reducers: {
    setPartProducts: (state, action) => {
      state.partProducts = action.payload;
    },
    setPartCategories: (state, action) => {
      state.partCategories = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    resetParts: () => initialState,
    addOrUpdateCartItem: (state, action) => {
      const { id, product, quantity } = action.payload;
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.id === id
      );

      if (existingItemIndex >= 0) {
        if (quantity > 0) {
          state.cartItems[existingItemIndex].quantity = quantity;
        } else {
          state.cartItems.splice(existingItemIndex, 1);
        }
      } else if (quantity > 0) {
        state.cartItems.push({
          id,
          ...product,
          quantity,
        });
      }
    },
    removePartItem: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );
    },
    resetCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const {
  setPartProducts,
  setPartCategories,
  setLoading,
  setSelectedCategory,
  resetParts,
  addOrUpdateCartItem,
  removePartItem,
  resetCart,
} = partSlice.actions;

// Selectors
export const selectPartProducts = (state) => state.parts.partProducts;
export const selectPartCategories = (state) => state.parts.partCategories;
export const selectIsLoading = (state) => state.parts.isLoading;
export const selectSelectedCategory = (state) => state.parts.selectedCategory;
export const selectCartItems = (state) => state.parts.cartItems;

export default partSlice.reducer;
