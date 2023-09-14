import { createSlice } from '@reduxjs/toolkit'
import { AppState } from '../../app/store'
import { HYDRATE } from 'next-redux-wrapper'

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
        setOperatorState(state, action) {
            state.operators = action.payload
        }
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
            return {
                ...state,
                ...action.payload
            }
        }
    }
})

export const { setOperatorState } = operatorsSlice.actions
export const selectOperatorState = (state: AppState) => state.operatorsApi.queries.operators

export default operatorsSlice.reducer