import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import StatePanel from './StatePanel'

// UI-level guard only. Real enforcement is done by Row Level Security in the database.
export default function ProtectedRoute({ roles, children }) {
  const { user, profile, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <div className="container"><StatePanel variant="loading" title="Checking your session" /></div>
  if (!user) return <Navigate to="/auth" state={{ from: loc.pathname + loc.search + loc.hash }} replace />
  if (profile?.is_suspended) return <div className="container"><StatePanel variant="error" title="Account access is suspended" message="Please contact an administrator for help." /></div>
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" replace />
  return children
}
