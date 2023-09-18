import { counterSlice } from "./features";

// 🧱 reducer object where each key represents a slice of the application's state, and the corresponding value is the reducer function that manages that slice
export const reducer = {
  counter: counterSlice.reducer,
};
