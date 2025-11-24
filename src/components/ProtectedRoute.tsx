import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@hooks/store'

export default function ProtectedRoute() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

