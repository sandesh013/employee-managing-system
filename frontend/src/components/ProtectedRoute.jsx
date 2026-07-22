import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

// Wraps a route: redirects to /login if not authenticated, and to /
// (dashboard) if the user's role isn't in the allowed list for that route.
function ProtectedRoute({ children, roles }) {
  const { user, token } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
