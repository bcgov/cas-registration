import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { createNewOperatorAsync } from "./thunks"

const initialState: OperatorsSliceState = {
    operators: [],
    status: "idle"
}

export const operatorsSlice = createSlice({
    name: "operators",
    initialState,
    reducers: {
        createNewOperator: (state, action: PayloadAction<Operator>) => {
            state.operators = [...state.operators, action.payload]
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createNewOperatorAsync.pending, (state) => {
                state.status = "loading"
            })
            .addCase(createNewOperatorAsync.fulfilled, (state, action) => {
                state.status = "idle"
                state.operators = [...state.operators, action.payload]
            })
    }
})

export interface Operator {
    legalName?: string
    tradeName?: string
    craBusinessNumber?: string
    bcCorporateRegistryNumber?: string
    mailingAddress?: string
}

export type OperatorsSliceState = {
    operators: Operator[],
    status: "idle" | "loading" | "failed"
}