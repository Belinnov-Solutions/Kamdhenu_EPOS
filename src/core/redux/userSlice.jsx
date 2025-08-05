import { createSlice } from "@reduxjs/toolkit";

// Helper functions for localStorage
const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("userState");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    console.warn("Failed to load user state from localStorage", e);
    return undefined;
  }
};

const saveToLocalStorage = (state) => {
  try {
    const { userId, username, roleName, storeId, isActive, name, address, phone, email } = state;
    const serializedState = JSON.stringify({
      userId,
      username,
      roleName,
      storeId,
      isActive,
      name,
      address,
      phone,
      email
    });
    localStorage.setItem("userState", serializedState);
  } catch (e) {
    console.warn("Could not save user state to localStorage", e);
  }
};

const clearLocalStorage = () => {
  try {
    localStorage.removeItem("userState");
  } catch (e) {
    console.warn("Failed to clear user state from localStorage", e);
  }
};

const initialState = {
  userId: null,
  username: null,
  roleName: null,
  storeId: null,
  isActive: false,
  status: "idle",
  error: null,
  name : null, 
  address : null,
  phone : null,
  email : null
};

// Load initial state from localStorage if available
const persistedState = loadFromLocalStorage();

const userSlice = createSlice({
  name: "user",
  initialState: persistedState || initialState,
  reducers: {
    userLoading: (state) => {
      state.status = "loading";
    },
    loginSuccess: (state, action) => {
      const { userid, username, rolename, storeid, isactive, name, address, phone, email } = action.payload;
      state.userId = userid;
      state.username = username;
      state.roleName = rolename;
      state.storeId = storeid;
      state.isActive = isactive;
      state.name = name;
      state.address = address;
      state.phone = phone;
      state.email = email;
      state.status = "succeeded";
      state.error = null;
      saveToLocalStorage(state);
    },
    logoutSuccess: () => {
      // Fixed: removed unused state parameter
      clearLocalStorage();
      return initialState;
    },
    userFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const { userLoading, loginSuccess, logoutSuccess, userFailed } =
  userSlice.actions;

// Custom middleware to persist state changes to localStorage
export const persistUserMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type === loginSuccess.type || action.type === logoutSuccess.type) {
    const state = store.getState().user;
    if (action.type === loginSuccess.type) {
      saveToLocalStorage(state);
    } else if (action.type === logoutSuccess.type) {
      clearLocalStorage();
    }
  }
  return result;
};

export default userSlice.reducer;
