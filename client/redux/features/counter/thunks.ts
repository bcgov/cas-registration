import { createAppAsyncThunk } from "@/redux/createAppAsyncThunk";
import { fetchCount } from "./fetchCount";

// 🚀 Thunk function typically used to make async requests
// allows performing async logic that  can be dispatched like a regular action: `dispatch(incrementAsync(10))`
export const incrementAsync = createAppAsyncThunk(
  "counter/fetchCount", // 1. action type prefix
  async (amount: number) => {
    // 2. Thunk function
    const response = await fetchCount(amount); // 3. Asynchronous logic
    return response.data; // 4. Data returned by the asynchronous logic- the `fulfilled` action payload
  }
);
