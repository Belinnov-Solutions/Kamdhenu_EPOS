import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  extras: [],
  reportedIssues: [],
  preRepairInspections: [],
  extrasChecklist: [],
  issuesChecklist: [],
  preRepairChecklist: [], // Add this new state for checklist items
};

const checklistSlice = createSlice({
  name: "checklist",
  initialState,
  reducers: {
    extrasAdded: (state, action) => {
      state.extras.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },

    reportedIssuesAdded: (state, action) => {
      state.reportedIssues.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },

    preRepairInspectionAdded: (state, action) => {
      state.preRepairInspections.push({
        ...action.payload,
        repairOrderId: action.payload.repairOrderId,
        ticketId: action.payload.ticketId,
        timestamp: new Date().toISOString(),
      });
    },

    // Add this new reducer
    preRepairChecklistAdded: (state, action) => {
      state.preRepairChecklist = action.payload;
    },

    clearChecklist: (state) => {
      state.extras = [];
      state.reportedIssues = [];
      state.preRepairInspections = [];
      state.preRepairChecklist = []; // Clear this too
    },
  },
});

export const {
  extrasAdded,
  reportedIssuesAdded,
  preRepairInspectionAdded,
  preRepairChecklistAdded, // Export the new action
  clearChecklist,
} = checklistSlice.actions;

// Selectors
export const selectExtras = (state) => state.checklist.extras;
export const selectReportedIssues = (state) => state.checklist.reportedIssues;
export const selectPreRepairInspections = (state) =>
  state.checklist.preRepairInspections;
export const selectPreRepairChecklist = (state) =>
  state.checklist.preRepairChecklist; // Add this new selector
export const selectChecklistSessionId = (state) => state.checklist.sessionId;

export default checklistSlice.reducer;
