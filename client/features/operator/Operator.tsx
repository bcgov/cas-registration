import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { create } from './operatorsSlice'
import { Operator } from '../../app/services/types'

// export function Operator() {
//     const operators = useAppSelector((state: { operators: Operator[] }) => state.operators)
//     const dispatch = useAppDispatch()
// }