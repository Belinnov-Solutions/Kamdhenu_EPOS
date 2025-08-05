import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentService: null,
  selectedServices: [], // Initialize as empty array
};

const serviceTypeSlice = createSlice({
  name: "serviceType",
  initialState,
  reducers: {
    serviceTypeSelected: (state, action) => {
      state.currentService = action.payload;
      state.selectedServices = [action.payload]; // Replace with new service
    },
    clearCurrentService: (state) => {
      state.currentService = null;
    },
    removeSelectedService: (state, action) => {
      state.selectedServices = state.selectedServices.filter(
        (service) => service.id !== action.payload
      );
    },
    clearSelectedServices: (state) => {
      state.selectedServices = [];
    },
  },
});

export const {
  serviceTypeSelected,
  clearCurrentService,
  removeSelectedService,
  clearSelectedServices,
} = serviceTypeSlice.actions;

export default serviceTypeSlice.reducer;
