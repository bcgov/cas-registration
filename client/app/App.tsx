import React from 'react'
import OBPSRoutes from './Routes'

const App: React.FunctionComponent = () => {
    return (
        <React.StrictMode>
            <OBPSRoutes />
        </React.StrictMode>
    )
}

export default React.memo(App)