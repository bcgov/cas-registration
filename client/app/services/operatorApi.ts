import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Operator } from './types'

export const operatorApi = createApi({
    reducerPath: 'operatorApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/'}),
    endpoints: (builder) => ({
        operators: builder.query<Operator[], void>({
            query: () => "/operators"
        }),
        getOperatorByName: builder.query<Operator, string>({
            query: (name) => `operator/${name}`
        }),
        addOperator: builder.mutation({
            query: (operator) => ({
                url: "/operators",
                method: "POST",
                body: operator
            })
        }),
        updateOperator: builder.mutation({
            query: ({id, ...rest }) => ({
                url: `/operators/${id}`,
                method: "PUT",
                body: rest
            })
        })
    })
})

export const { useOperatorsQuery, useGetOperatorByNameQuery, useAddOperatorMutation, useUpdateOperatorMutation } = operatorApi