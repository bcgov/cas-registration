import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { operatorsApi } from './services/operatorsApi'
import { createWrapper } from 'next-redux-wrapper'

const makeStore = () => configureStore({
    reducer: {
        [operatorsApi.reducerPath]: operatorsApi.reducer
    },
    devTools: true,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(operatorsApi.middleware)
})

export type AppStore = ReturnType<typeof makeStore>
export type AppState = ReturnType<AppStore["getState"]>
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    AppState,
    unknown,
    Action
>
export const wrapper = createWrapper<AppStore>(makeStore)
