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

  useEffect(() => { setOpen(false) }, [loc.pathname])
  useEffect(() => {
    if (!user) return setUnread(0)
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false).then((r) => setUnread(r.count || 0))
  }, [user, loc.pathname, loc.search])

  const logout = async () => { await signOut(); nav('/') }
  return (
    <header className="nav">
      <Link to="/" className="brand"><span className="logo">✦</span>Sympo<b>Connect</b></Link>
      <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>☰</button>
      <nav className={open ? 'open' : ''}>
        <NavLink to="/events">Discover</NavLink>
        <NavLink to="/p/about">About</NavLink>
        <NavLink to="/p/contact">Contact</NavLink>
        <NavLink to="/submit">Post an event</NavLink>
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
        {user && <Link to="/dashboard?tab=notifications" aria-label={unread ? `${unread} unread notifications` : 'Notifications'}>🔔{unread > 0 && <span className="count">{unread}</span>}</Link>}
        {['staff', 'admin'].includes(profile?.role) && <NavLink to="/staff">Staff</NavLink>}
        {profile?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        {user ? <button className="btn ghost" onClick={logout}>Log out</button> : <Link className="btn primary" to="/auth">Log in</Link>}
      </nav>
    </header>
  )
}
