import { User } from "@/redux/index";
import { apiSlice } from "@/redux/features/api/slice"; // apiSlice import is not correctly resolved using "@/redux/index";
import { createSelector } from "@reduxjs/toolkit";

/* 🎯 Selector function, allowing us to retrieve RTKQ’s cached data.
Each endpoint provides a select function that returns a selector for its cached data from the store
(this selector may receive a cache key as an argument, which is the same argument we would call the query hooks with).
*/

//use the endpoint.select()function to create selectors from cached RTK Query data, see RTK Advanced Patterns: https://redux.js.org/tutorials/essentials/part-8-rtk-query-advanced
export const selectUserResult = apiSlice.endpoints.getUsers.select(null);

// Define an array of empty users (assuming User is an array)
const emptyUsers: User[] = [];

// Create a selector that uses createSelector from Redux Toolkit
export const selectUserData = createSelector(
  selectUserResult, // Input selector: the result of getUsers endpoint
  (usersResult) => usersResult?.data ?? emptyUsers, // Selector function: returns user data or emptyUsers if data is null/undefined
);
