import { createSlice } from "@reduxjs/toolkit";
import { UserData } from "./types";

// 🔴 State: set initial state of slice
const initialState = {
  data: [],
} as UserData;

// 🍕 Slice: RTK’s createSlice to create a Redux slice
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserData: () => {
      return initialState;
    },
  },
});

// 🚀 dispatches a setCredentials action to store the user and token information.
export const { resetUserData } = userSlice.actions;
