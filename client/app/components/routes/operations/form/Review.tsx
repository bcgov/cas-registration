"use client";

import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Box from '@mui/material/Box'
import RecommendIcon from '@mui/icons-material/Recommend'
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb'
import { operationStatusUpdateHandler } from '@/app/utils/actions';
import { OperationsFormData } from '@/app/components/form/OperationsForm';
import { useState } from 'react';

interface Props {
    operation: OperationsFormData
}

export default function Review(props: Props) {
    const [requestStatus, setRequestStatus] = useState(props.operation.status)
    const [error, setError] = useState(undefined)

    async function approveRequest() {
        props.operation.status = "Approved"
        const response = await operationStatusUpdateHandler(props.operation)
        if (response.error) {
            setError(response.error)
            return
        } else if (response.status === 200) {
            alert('You have approved the request for carbon tax exemption')
        }
    }

    return (
        <>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'right'
            }}>
                <ButtonGroup variant="contained">
                    <Button onClick={approveRequest} color="success" aria-label="Approve application">Approve <RecommendIcon /></Button>
                    <Button color="error" aria-label="Reject application">Reject <DoNotDisturbIcon /></Button>
                </ButtonGroup>
            </Box>
        </>
    )
}