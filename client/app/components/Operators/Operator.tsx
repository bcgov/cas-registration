"use client"

import { useState } from "react"

import {
    operatorsSlice,
    useSelector,
    useDispatch,
    selectOperators,
} from "@/redux"

export const Operator = () => {
    const dispatch = useDispatch()
    const operators = useSelector(selectOperators)

    return (
        <>

        </>
    )
}