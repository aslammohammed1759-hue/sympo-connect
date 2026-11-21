import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const loc = useLocation()
  const nav = useNavigate()
  const currentPath = loc.pathname.replace(/\/+$/, '') || '/'
  const dashboardTab = new URLSearchParams(loc.search).get('tab')
  const dashboardActive = currentPath === '/dashboard' && dashboardTab !== 'notifications'
  const notificationsActive = currentPath === '/dashboard' && dashboardTab === 'notifications'

  useEffect(() => { setOpen(false) }, [loc.pathname, loc.search])
  useEffect(() => {
    if (!user) return setUnread(0)
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false).then((r) => setUnread(r.count || 0))
  }, [user, loc.pathname, loc.search])

  const logout = async () => { await signOut(); nav('/') }
  return (
    <header className="nav">
      <Link to="/" className="brand"><span className="logo">✦</span>Sympo<b>Connect</b></Link>
      <button
        type="button"
        className="burger"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="primary-navigation"
      >☰</button>
      <nav id="primary-navigation" className={open ? 'open' : ''} aria-label="Main navigation">
        <NavLink to="/events">Discover</NavLink>
        <NavLink to="/submit">Post an event</NavLink>
        {user && <Link
          to="/dashboard"
          className={dashboardActive ? 'active' : undefined}
          aria-current={dashboardActive ? 'page' : undefined}
        >Dashboard</Link>}
        {user && <Link
          to="/dashboard?tab=notifications"
          className={notificationsActive ? 'active' : undefined}
          aria-current={notificationsActive ? 'page' : undefined}
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        >🔔{unread > 0 && <span className="count">{unread}</span>}</Link>}
        {['staff', 'admin'].includes(profile?.role) && <NavLink to="/staff">Staff</NavLink>}
        {profile?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        {user ? <button className="btn ghost" onClick={logout}>Log out</button> : <Link className="btn primary" to="/auth">Log in</Link>}
      </nav>
    </header>
  )
}
