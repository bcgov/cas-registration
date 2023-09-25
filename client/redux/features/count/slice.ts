import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// 🔴 Status: set initial state of slice- counterSlice
const initialState: CounterSliceState = {
  value: 0,
  status: "idle",
};

// 🍕 Slice: create Redux Toolkit slice - countSlice
export const countSlice = createSlice({
  name: "count",
  initialState,
  //`reducers` field used to update the state in a deterministic and immutable manner, lets us define and generate associated reducer functions\actions
  // Redux Toolkit simplifies the process of writing reducers by allowing you to write "mutating" logic as if you were directly modifying the state.
  // Under the hood, Immer tracks changes and produces an updated state while preserving the immutability requirement.
  reducers: {
    // a reducer takes two arguments: the current state and an action object
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    resetCount: () => {
      return initialState;
    },
  },
});

// 🚀 dispatch actions
export const { decrement, increment, resetCount } = countSlice.actions;

// 📐 Type: define structure for type- CounterSliceState
export type CounterSliceState = {
  value: number;
  status: "idle" | "loading" | "failed";
};
