import { configureStore } from '@reduxjs/toolkit'
import { operatorApi } from './services/operatorApi'

export const store = configureStore({
    reducer: {
        [operatorApi.reducerPath]: operatorApi.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(operatorApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch