import { Navigate } from 'react-router-dom'
import { getAuthToken } from './authStorage'

type Props = {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
    const token = getAuthToken()

    if (!token) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}