import type { RootState } from "@/redux/index";

// 🎯 Selector function, allowing us to retrieve a value from the Redux state.
// Selectors can also be defined inline where they're used, instead of within the slice file.

export const selectCurrentUser = (state: RootState) => state.auth.user;
