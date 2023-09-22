// Need to use the React-specific entry point to allow generating React hooks
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Operation } from "..";

// Define a service using a base URL and expected endpoints
export const djangoApiSlice = createApi({
  reducerPath: "djangoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/registration",
  }),
  endpoints: (builder) => ({
    getOperations: builder.query<Operation[], null>({
      query: () => "operations",
    }),
    getOperation: builder.query({
      query: (operationId) => `/operations/${operationId}`,
    }),
    addNewOperation: builder.mutation({
      query: (initialOperation) => ({
        url: "/operations",
        method: "POST",
        // Include the entire post object as the body of the request
        body: initialOperation,
      }),
    }),
  }),
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const {
  useGetOperationsQuery,
  useGetOperationQuery,
  useAddNewOperationMutation,
} = djangoApiSlice;
