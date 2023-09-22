export type Operator = {
    legalName: string | null
    tradeName: string | null
    craBusinessNumber: string | null
    bcCorporateRegistryNumber: string | null
    mailingAddress: string | null
}

export type OperatorData = {
    data: Operator[] | null | undefined
}