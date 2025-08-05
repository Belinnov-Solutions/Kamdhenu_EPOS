// src/core/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer";
import themeSettingSlice from "./themeSettingSlice";
import customerSlice from "./customerSlice";
import repairSlice from "./repairSlice";
import ticketRefreshReducer from "./ticketRefreshSlice";
import userSlice, { persistUserMiddleware } from "./userSlice"; // Import the new user slice
import accessoriesReducer from "./accessoriesSlice";
import serviceTypeReducer from "./serviceTypeSlice";
import partReducer from "./partSlice";
import ticketReducer from "./ticketSlice";
import checklistReducer from "./checklistSlice";

const store = configureStore({
  reducer: {
    rootReducer: rootReducer,
    themeSetting: themeSettingSlice,
    customer: customerSlice,
    repair: repairSlice,
    ticketRefresh: ticketRefreshReducer,
    user: userSlice, // Add the user slice
    accessories: accessoriesReducer,
    serviceType: serviceTypeReducer,
    parts: partReducer,
    ticket: ticketReducer,
    checklist: checklistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(persistUserMiddleware),
});

export default store;
