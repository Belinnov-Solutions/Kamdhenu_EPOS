// src/core/redux/slices/customerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  customerId: null,
  customerName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  country: "",
  zipcode: "",
  status: "idle",
  error: null,
  createdAt: null,
  delind: false,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    customerLoading: (state) => {
      state.status = "loading";
    },
    customerAdded: (state, action) => ({
      ...initialState,
      ...action.payload,
      status: "succeeded",
      error: null,
    }),
    customerFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
    clearCustomer: () => initialState,
  },
});

export const { customerLoading, customerAdded, customerFailed, clearCustomer } =
  customerSlice.actions;
export default customerSlice.reducer;
