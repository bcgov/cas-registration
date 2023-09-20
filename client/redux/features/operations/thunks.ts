import { createAppAsyncThunk } from "@/redux/createAppAsyncThunk";
import { retrieveOperations } from "./fetchOperations";

export const retrieveAsync = createAppAsyncThunk(
  "operations/retrieve",
  async () => {
    const response = await retrieveOperations();
    return response.data;
  }
);
