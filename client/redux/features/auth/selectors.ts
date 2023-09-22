import type { ReduxState } from "@/redux";

// 🎯 Selector function, allowing us to retrieve a value from the Redux state.
export const selectUser = (state: ReduxState) => state.auth.user;
export const selectUserToken = (state: ReduxState) => state.auth.token;
