import { apiSlice } from "@/redux/features/api/slice";

export const selectOperatorsData = apiSlice.endpoints.getOperators.select(null)