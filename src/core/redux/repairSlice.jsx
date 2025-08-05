import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  repairItems: [],
  status: "idle",
  error: null,
};

const repairSlice = createSlice({
  name: "repair",
  initialState,
  reducers: {
    repairAdded: (state, action) => {
      return {
        ...state,
        repairItems: [...state.repairItems, action.payload],
        status: "succeeded",
        error: null,
      };
    },
    repairUpdated: (state, action) => {
      const index = state.repairItems.findIndex(
        (item) => item.repairOrderId === action.payload.repairOrderId
      );

      if (index !== -1) {
        state.repairItems[index] = action.payload;
      }

      // console.log("State after update:", state);
    },
    repairRemoved: (state, action) => {
      state.repairItems = state.repairItems.filter(
        (item) => item.repairOrderId !== action.payload
      );
    },
    repairFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
    clearRepairs: () => {
      return initialState;
    },
    removeRepairByOrderId: (state, action) => {
      state.repairItems = state.repairItems.filter(
        (item) => item.repairOrderId !== action.payload
      );
    },
  },
});

// Helper selector for debugging
export const selectRepairState = (state) => {
  return state.repair;
};
export const {
  repairAdded,
  repairUpdated,
  repairRemoved,
  repairFailed,
  clearRepairs,
  removeRepairByOrderId, // Add this
} = repairSlice.actions;
export default repairSlice.reducer;
