import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'

// UI-level guard only. Real enforcement is done by Row Level Security in the database.
export default function ProtectedRoute({ roles, children }) {
  const { user, profile, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <p className="center">Loading…</p>
  if (!user) return <Navigate to="/auth" state={{ from: loc.pathname + loc.search }} replace />
  if (profile?.is_suspended) return <p className="center">Your account is suspended. Please contact an administrator.</p>
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" replace />
  return children
}
