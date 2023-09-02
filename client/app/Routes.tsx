import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { NoMatchPage } from '@/pages/NoMatchPage'
// import AuthWrapper from 'features/auth/components/AuthWrapper'
import { REGISTRATION_ROUTE } from '../utils/constants'
const RegistrationPage = lazy(() => import('../pages/RegistrationPage'))

const OBPSRoutes: React.FunctionComponent = () => {
    return (
        <Router>
            <Suspense>
            <Routes>
                <Route path={REGISTRATION_ROUTE} element={
                    // TODO: <AuthWrapper> will go around this page
                        <RegistrationPage />
                } />
                <Route path="*" element={<NoMatchPage />} />
            </Routes>
            </Suspense>
        </Router>
    )
}

export default React.memo(OBPSRoutes)