import { store } from "@/redux/index"
import { useGetOperatorsQuery } from "@/redux/index"
import * as React from "react"
import { Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material"


export default function OperatorsList() {
    const operatorData = store.getState().operators

    const { data, isLoading, error } = useGetOperatorsQuery(null)

    let content = <div></div>

    if (isLoading) {
        content = <div>Loading Operator data...</div>
    }

    if (error) {
        content = <div>Encountered error retrieving Operator data!</div>
    }

    if (data) {
        content = (
            <>
            <div>
                {operatorData}
            </div>
            <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                <List>
                    {data?.map((operator, index) => (
                      <ListItem disablePadding key={index}>
                        <ListItemButton>
                            <ListItemText>{`${operator.tradeName}`}</ListItemText>
                        </ListItemButton>
                      </ListItem>
                    ))}
                </List>
            </Box>
            </>
        )
    }

    return (
        <>
            <div className="flex items-center h-screen w-full">
                <div className="w-full bg-white rounded shadow-lg p-8 m-4 md:max-w-sm md:mx-auto">
                    <span className="block w-full text-xl uppercase font-bold mb-4">
                        Select Your Operator
                    </span>
                    <div>
                        {content}
                    </div>
                </div>
            </div>
        </>
    )
}