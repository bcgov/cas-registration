import { createAppAsyncThunk } from "@/redux/createAppAsyncThunk";
import { fetchOperators } from "./fetchOperators"

export const createNewOperatorAsync = createAppAsyncThunk(
    "operators/",
    async () => {
        const response = await fetchOperators()
        return response.data
    }
)