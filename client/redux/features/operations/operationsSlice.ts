import { createSlice } from "@reduxjs/toolkit";
import { retrieveAsync } from "./thunks";

// 📐 Type: define structure for type- OperationsSliceState
export type OperationsSliceState = {
  value: [];
  status: "idle" | "loading" | "failed";
};

const initialState: OperationsSliceState = {
  value: [],
  status: "idle",
};

export const operationsSlice = createSlice({
  name: "operations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // builder is Redux Toolkit object that allows defining these additional reducers
    builder
      .addCase(retrieveAsync.pending, (state) => {
        state.status = "loading"; // 🔄 Handle a pending async action
      })
      .addCase(retrieveAsync.fulfilled, (state, action) => {
        state.status = "idle"; // ✔️ Handle a successful async action
        state.value += action.payload;
      });
  },
});

const { reducer } = operationsSlice;
export default reducer;
