import { Operator } from "./operatorsSlice"

export const fetchOperators = async (): Promise<{ data: Operator}> => {
    const response = await fetch("http://localhost:8000/api/operators", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    const result = await response.json()

    return result
}