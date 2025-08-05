// In your repairSlice.js or a new slice
import { createSlice } from "@reduxjs/toolkit";

const ticketRefreshSlice = createSlice({
  name: "ticketRefresh",
  initialState: {
    refreshCount: 0,
  },
  reducers: {
    triggerRefresh: (state) => {
      state.refreshCount += 1;
    },
  },
});

export const { triggerRefresh } = ticketRefreshSlice.actions;
export default ticketRefreshSlice.reducer;
