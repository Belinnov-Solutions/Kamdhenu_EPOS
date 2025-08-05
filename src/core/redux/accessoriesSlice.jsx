import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessoryProducts: [],
  repairCategories: [],
  subCategories: [],
  // selectedCategory: null,
  isLoading: false,
  cartItems: [],
};

const accessoriesSlice = createSlice({
  name: "accessories",
  initialState,
  reducers: {
    setAccessoryProducts: (state, action) => {
      state.accessoryProducts = action.payload;
    },
    setRepairCategories: (state, action) => {
      state.repairCategories = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSubCategories: (state, action) => {
    state.subCategories = action.payload;
  },
    // setSelectedCategory: (state, action) => {
    //   state.selectedCategory = action.payload;
    // },
    // resetAccessories: () => initialState,
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
    removeCartItem: (state, action) => {
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
  setAccessoryProducts,
  setRepairCategories,
  setLoading,
  setSubCategories,
  // setSelectedCategory,
  // resetAccessories,
  addOrUpdateCartItem,
  removeCartItem,
  resetCart,
} = accessoriesSlice.actions;

// Selectors
export const selectAccessoryProducts = (state) =>
  state.accessories.accessoryProducts;
export const selectRepairCategories = (state) =>
  state.accessories.repairCategories;
export const selectIsLoading = (state) => state.accessories.isLoading;
// export const selectSelectedCategory = (state) =>
//   state.accessories.selectedCategory;
export const selectSubCategories = (state) => state.accessories.subCategories;
export const selectCartItems = (state) => state.accessories.cartItems;

export default accessoriesSlice.reducer;
