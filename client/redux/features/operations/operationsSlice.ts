// import { createSlice } from "@reduxjs/toolkit";
// import { retrieveAsync } from "./thunks";

// const initialState: OperationsSliceState = {
//   value: [],
//   status: "idle",
// };

// export const operationsSlice = createSlice({
//   name: "operations",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     // builder is Redux Toolkit object that allows defining these additional reducers
//     builder
//       .addCase(retrieveAsync.pending, (state) => {
//         state.status = "loading"; // 🔄 Handle a pending async action
//       })
//       .addCase(retrieveAsync.fulfilled, (state, action) => {
//         state.status = "idle"; // ✔️ Handle a successful async action
//         state.value += action.payload;
//       });
//   },
// });

// const operationsSlice = createSlice(/* omit slice code*/)

// export const { operationAdded, operationUpdated, reactionAdded } = operationsSlice.actions

// export default operationsSlice.reducer

// export const selectAllOperations = state => state.operations

// export const selectOperationById = (state, operationId) =>
//   state.operations.find(operation => operation.id === operationId)

// const { reducer } = operationsSlice;
// export default reducer;

import { createSlice } from "@reduxjs/toolkit";
import { OperationsData, OperationsState } from "./types";

const initialState = [
  { id: "1", title: "First Operation!", content: "Hello!" },
  { id: "2", title: "Second Operation", content: "More text" },
];

export const operationsSlice = createSlice({
  name: "operations",
  initialState,
  reducers: {
    operationAdded(state, action) {
      state.push(action.payload);
    },

    operationUpdated(state, action) {
      const { id, title, content } = action.payload;
      const existingOperation = state.find((operation) => operation.id === id);
      if (existingOperation) {
        existingOperation.title = title;
        existingOperation.content = content;
      }
    },
  },
});

export const { operationAdded, operationUpdated } = operationsSlice.actions;

// export default operationsSlice.reducer;

export const selectAllOperations = (state: OperationsData) => state.operations;

export const selectOperationById = (
  state: OperationsData,
  operationId: number
) => state.operations?.find((operation) => operation.id === operationId);
