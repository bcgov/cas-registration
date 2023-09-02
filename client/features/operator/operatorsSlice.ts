import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

interface Operator {
    name: string
}

interface OperatorState {
    operators: Operator[]
}

const initialState: OperatorState = {
    operators: []
}

export const operatorsSlice = createSlice({
    name: 'operators',
    initialState,
    reducers: {
        create: (state, action: PayloadAction<Operator[]>) => {
            state.operators = action.payload
        }
    }
})

export const { create } = operatorsSlice.actions
export const selectOperator = (state: RootState) => state.operatorApi

export default operatorsSlice.reducer