import { useOperatorsQuery } from '../app/services/operatorApi'
import React from 'react'

const RegistrationPage = () => {
    const { data, error, isLoading, isSuccess } = useOperatorsQuery()

    return (
        <div>
            {error ? (
                <>Encountered error</>
            ) : isLoading ? (
                <>Loading...</>
            ) : isSuccess && (
                <>
                {data.map((operator) => (
                    <h3>{operator.name}</h3>
                ))}
                </>
            )
        }
        </div>
    )

}

export default React.memo(RegistrationPage)