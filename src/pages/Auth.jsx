import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ email: '', password: '', full_name: '', college_name: '', district: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()
  const from = useLocation().state?.from || '/dashboard'
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setMsg('')
    if (f.password.length < 8) return setErr('Password must be at least 8 characters.')
    if (mode === 'signup' && (!f.full_name.trim() || !f.college_name.trim() || !f.district.trim())) return setErr('Please fill in your name, college and district.')
    setBusy(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email.trim(), password: f.password })
      setBusy(false)
      return error ? setErr(error.message) : nav(from, { replace: true })
    }
    const { data, error } = await supabase.auth.signUp({
      email: f.email.trim(), password: f.password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: f.full_name.trim(), college_name: f.college_name.trim(), district: f.district.trim() } },
    })
    setBusy(false)
    if (error) return setErr(error.message)
    if (data.session) nav(from, { replace: true })
    else setMsg('Account created. Check your email and click the verification link, then log in.')
  }

  return (
    <div className="auth card">
      <div className="tabs"><button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>Log in</button><button className={mode === 'signup' ? 'on' : ''} onClick={() => setMode('signup')}>Sign up</button></div>
      <form onSubmit={submit}>
        {mode === 'signup' && <>
          <label>Full name<input value={f.full_name} onChange={set('full_name')} maxLength={100} /></label>
          <label>College name<input value={f.college_name} onChange={set('college_name')} maxLength={150} /></label>
          <label>District<input value={f.district} onChange={set('district')} maxLength={80} /></label>
        </>}
        <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
        <label>Password<input type="password" required minLength={8} value={f.password} onChange={set('password')} /></label>
        {err && <p className="alert">{err}</p>}
        {msg && <p className="notice">{msg}</p>}
        <button className="btn primary wide" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
      </form>
    </div>
  )
}
