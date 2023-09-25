import { configureStore } from "@reduxjs/toolkit";
import {
  useSelector as useReduxSelector, //hook provided by the "react-redux" library. It's used in React components to select and extract data from the Redux store.
  useDispatch as useReduxDispatch, // hook provided by the "react-redux" library. It's used to get access to the Redux store's dispatch function, allowing you to dispatch actions
  type TypedUseSelectorHook,
} from "react-redux";
import { apiSlice } from "@/redux/features/api/slice";
import { reducer } from "./rootReducer";

// 🛠️ Create the Redux store using configureStore from Redux Toolkit
export const reduxStore = configureStore({
  // 📚 Reducer object that contains all the reducers for your Redux store
  reducer,
  // ⚙️ Enable Redux DevTools extension in development mode
  devTools: process.env.NODE_ENV !== "production",
  // 🔄 Middleware configuration to intercept and process actions
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware), // 🚀 Enable RTK Query middleware
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
