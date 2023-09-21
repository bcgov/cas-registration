import type { ReduxState } from "@/redux";
import type { RootState } from "@/redux/index";

// 🎯 Selector function, allowing us to retrieve a value from the Redux state.
// Selectors can also be defined inline where they're used, instead of within the slice file.
// For example: `useSelector((state: RootState) => state.counter.value)`
export const selectOperations = (state: ReduxState) => {
  console.log("state", state);
  return state.operations;
};
