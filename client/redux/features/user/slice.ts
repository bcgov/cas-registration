import { createSlice } from "@reduxjs/toolkit";
import type { UserData } from "@/redux/index";

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

// 🚀 dispatch actions
export const { resetUserData } = userSlice.actions;
