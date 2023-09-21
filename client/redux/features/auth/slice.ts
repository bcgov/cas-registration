import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/redux/index";

// 🔴 State: set initial state of slice
const initialState = {
  user: null,
  token: null,
} as AuthState;

// 🍕 Slice: RTK’s createSlice to create a Redux slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = user;
      state.token = token;
    },
    resetAuth: () => {
      return initialState;
    },
  },
});

// 🚀 dispatches a setCredentials action to store the user and token information.
export const { setCredentials, resetAuth } = authSlice.actions;
