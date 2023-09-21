import { configureStore } from "@reduxjs/toolkit";
import { apiSlice, djangoApiSlice, reducer } from "@/redux/index";
import {
  useSelector as useReduxSelector,
  useDispatch as useReduxDispatch,
  type TypedUseSelectorHook,
} from "react-redux";

// 🛠️ Create the Redux store using configureStore from Redux Toolkit
export const store = configureStore({
  // 📚 Reducer object that contains all the reducers for your Redux store
  reducer,
  // ⚙️ Enable Redux DevTools extension in development mode
  devTools: process.env.NODE_ENV !== "production",
  // 🔄 Middleware configuration to intercept and process actions
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      apiSlice.middleware,
      djangoApiSlice.middleware,
    ]), // 🚀 Enable RTK Query middleware
});

// 📦 Define the type for the root state of your Redux store
export type RootState = ReturnType<typeof store.getState>;
// 📣 Define the type for the dispatch function of your Redux store
export type AppDispatch = typeof store.dispatch;

// 📐 Type: define types to ensure consistency in the application

// The type representing the Redux store instance
export type store = typeof store;

// The type representing the entire Redux state
export type ReduxState = ReturnType<typeof store.getState>;

// The type representing the Redux dispatch function
export type ReduxDispatch = typeof store.dispatch;

// 🚀 Dispatch: create a custom useDispatch hook for accessing the Redux dispatch function
export const useDispatch = () => useReduxDispatch<ReduxDispatch>();

// 🎯 Selectors: create a custom useSelector hook with typed selectors for accessing the Redux state
export const useSelector: TypedUseSelectorHook<ReduxState> = useReduxSelector;
