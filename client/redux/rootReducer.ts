import { apiSlice, authSlice } from "@/redux/index";

// 🧱 Reducer object
// Each reducer key represents a slice of the application's state, and the corresponding value is the reducer function that manages that slice
// A reducer is a function that specifies how the application's state changes in response to dispatched actions

// This reducer property object should contain all the reducers you want to use in the Redux store
export const reducer = {
  //api.reducerPath is generated automatically by RTK-Query based on the configuration and the name provided when creating the API instance in features\api\createAPI
  // it represents the slice of the Redux store where RTK-Query will manage its state, including caching and data fetching logic
  [apiSlice.reducerPath]: apiSlice.reducer, // RTK-Query API reduer
  auth: authSlice.reducer, // regular slice reducer
};
