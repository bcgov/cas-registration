import { apiSlice } from "@/redux/features/api/slice";

// 🎯 Selector function, allowing us to retrieve a value from the Redux state.

// Calling `someEndpoint.select(someArg)` generates a new selector that will return the query result object for a query with those parameters
export const selectUsersResult = apiSlice.endpoints.getUsers.select(null);
