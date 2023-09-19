import {
  configureStore,
  type ThunkAction,
  type Action,
} from "@reduxjs/toolkit";
import {
  useSelector as useReduxSelector,
  useDispatch as useReduxDispatch,
  type TypedUseSelectorHook,
} from "react-redux";

import { reducer } from "./rootReducer";

// 🏭 Store: create the Redux store using the provided reducer
export const reduxStore = configureStore({
  reducer,
});

// 🚀 Disptach: create a custom useDispatch hook for accessing the Redux dispatch function
export const useDispatch = () => useReduxDispatch<ReduxDispatch>();

// 🎯 Selectors: create a custom useSelector hook with typed selectors for accessing the Redux state
export const useSelector: TypedUseSelectorHook<ReduxState> = useReduxSelector;

// 📐 Type: define types to ensure consistency in the application

// The type representing the Redux store instance
export type ReduxStore = typeof reduxStore;

// The type representing the entire Redux state
export type ReduxState = ReturnType<typeof reduxStore.getState>;

// The type representing the Redux dispatch function
export type ReduxDispatch = typeof reduxStore.dispatch;

// The type for Redux thunk actions (asynchronous actions)
export type ReduxThunkAction<ReturnType = void> = ThunkAction<
  ReturnType,
  ReduxState,
  unknown,
  Action
>;
