import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Operator } from './types'

export const operatorsApi = createApi({
    reducerPath: 'operatorsApi',
    baseQuery: fetchBaseQuery({ baseUrl: `${process.env.API_URL}/api/`}),
    endpoints: (builder) => ({
        operators: builder.query<Operator[], void>({
            query: () => "/operators"
        }),
        getOperatorByName: builder.query<Operator, string>({
            query: (name) => `operators/${name}`
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

export const { useOperatorsQuery, useGetOperatorByNameQuery, useAddOperatorMutation, useUpdateOperatorMutation } = operatorsApi