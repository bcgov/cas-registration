import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ReduxState, ReduxDispatch } from "./store";

/**
 * 🛠️  Utility function to simplify the creation of asynchronous thunk actions
 */

// use method withTypes of Redux Toolkit createAsyncThunk utility
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  // type annotations of the expected types
  state: ReduxState;
  dispatch: ReduxDispatch;
  rejectValue: string;
}>();
