import type { OperationsData, ReduxState } from "@/redux";

// 🎯 Selector function, allowing us to retrieve a value from the Redux state.
// Selectors can also be defined inline where they're used, instead of within the slice file.
// For example: `useSelector((state: RootState) => state.counter.value)`
// nice to do it here so you don't have redo it on other pages
export const selectAllOperations = (state: ReduxState) => {
  return state.operations;
};

export const selectOperationById = (
  state: OperationsData,
  operationId: number
) => state.operations?.find((operation) => operation.id === operationId);
