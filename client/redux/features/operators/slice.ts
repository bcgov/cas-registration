import { createSlice } from "@reduxjs/toolkit"
import { OperatorData } from "./types"

const initialState = {
    data: []
} as OperatorData

export const operatorsSlice = createSlice({
    name: "operators",
    initialState,
    reducers: {
      resetOperatorsData: () => {
        return initialState
      }
    }
})

export const { resetOperatorsData } = operatorsSlice.actions

