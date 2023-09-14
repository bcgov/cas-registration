import type { NextPage } from 'next'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Operator } from './services/types'
import selectOperator from '../features/operator/operatorsSlice'
import List from '@/common_components/List'

const renderOperator = (operator: Operator) => {
    return (
        <div>
            <h3>{operator.name}</h3>
        </div>
    )
}

const OperatorsHome: NextPage = () => {
    const operators = useSelector(selectOperator)
    const dispatch = useDispatch()

    return (
        <div>
            <List items={operators.operators} renderItem={renderOperator} />
        </div>
    )
}