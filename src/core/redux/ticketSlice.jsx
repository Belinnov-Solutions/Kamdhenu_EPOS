import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ticketItems: [],
  status: "idle",
  error: null,
};

const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    ticketAdded: (state, action) => {
      return {
        ...state,
        ticketItems: [...state.ticketItems, action.payload],
        status: "succeeded",
        error: null,
      };
    },
    ticketUpdated: (state, action) => {
      const index = state.ticketItems.findIndex(
        (item) => item.ticketId === action.payload.ticketId
      );

      console.log("Found ticket at index:", index);

      if (index !== -1) {
        state.ticketItems[index] = action.payload;
      }

      console.log("State after update:", state);
    },
    ticketRemoved: (state, action) => {
      state.ticketItems = state.ticketItems.filter(
        (item) => item.ticketId !== action.payload
      );
    },
    removeTicketItem: (state, action) => {
      state.ticketItems = state.ticketItems.filter(
        (item) => item.repairOrderId !== action.payload
      );
    },
    ticketFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
    clearTickets: () => {
      return initialState;
    },
  },
});

// Helper selector for debugging
export const selectTicketState = (state) => {
  return state.ticket;
};

export const {
  ticketAdded,
  ticketUpdated,
  ticketRemoved,
  removeTicketItem,
  ticketFailed,
  clearTickets,
} = ticketSlice.actions;

export default ticketSlice.reducer;
