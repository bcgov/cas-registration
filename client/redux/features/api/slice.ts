import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LoginRequest, LoginResponse } from "@/redux/features/auth";
import { Operator } from "../operators";
import { User } from "../user/types";
import type { RootState } from "@/redux";

/*To interact with API endpoints, we need to create an API slice.
 Application should have one createApi call, to the same base URL, that should contain all endpoint definitions
*/

// 🚀 Create an API instance
export const apiSlice = createApi({
  // 🌐 Configure the base query
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/api/",
    // 🛡️ Prepare headers for authenticated requests
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // 🏁 Define API endpoints
  /*
  Each endpoint object contains:
    The same primary query/mutation hook that we exported from the root API slice object, but named as useQuery or useMutation
    For query endpoints, an additional set of query hooks for scenarios like "lazy queries" or partial subscriptions
    A set of "matcher" utilities to check for the pending/fulfilled/rejected actions dispatched by requests for this endpoint
    An initiate thunk that triggers a request for this endpoint
    A select function that creates memoized selectors that can retrieve the cached result data + status entries for this endpoint
  */
  endpoints: (builder) => ({
    // Define a login mutation
    //                       ResultType    QueryArg
    //                           v           v
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
    }),
    // Define a users query
    //                   ResultType  QueryArg
    //                       v        v
    getUsers: builder.query<User[], null>({
      query: () => "users",
    }),
    // TODO later: separate this out into a separate slice file for each URL
    // Define an Operators query
    getOperators: builder.query<Operator[], null>({
      query: () => "operators"
    })
  }),
});

// 📤 Export mutation hooks for endpoints
export const { useLoginMutation, useGetUsersQuery, useGetOperatorsQuery } = apiSlice;
