import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { isConfigured, supabase } from '../supabaseClient'

function authErrorMessage(error) {
  const message = error?.message || ''
  const details = `${error?.name || ''} ${message}`
  if (/failed to fetch|network request failed|fetcherror|authretryablefetcherror|load failed/i.test(details)) {
    return 'Network error or Supabase unreachable. Check your internet connection, project URL and anon key in .env.local. Also confirm your site URL and redirect URLs in Supabase Authentication settings. For self-hosted Supabase, verify its CORS allowed origins.'
  }
  return message || 'Authentication failed. Please try again.'
}

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
    if (!isConfigured || !supabase) return setErr('Network error or missing Supabase keys. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, then restart the dev server.')
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: f.email.trim(), password: f.password })
        if (error) return setErr(authErrorMessage(error))
        nav(from, { replace: true })
        return
      }
      const { data, error } = await supabase.auth.signUp({
        email: f.email.trim(), password: f.password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: f.full_name.trim(), college_name: f.college_name.trim(), district: f.district.trim() } },
      })
      if (error) return setErr(authErrorMessage(error))
      if (data.session) nav(from, { replace: true })
      else setMsg('Account created. Check your email and click the verification link, then log in.')
    } catch (error) {
      setErr(authErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth card">
      <div className="tabs" role="group" aria-label="Account action">
        <button type="button" className={mode === 'login' ? 'on' : ''} aria-pressed={mode === 'login'} onClick={() => setMode('login')}>Log in</button>
        <button type="button" className={mode === 'signup' ? 'on' : ''} aria-pressed={mode === 'signup'} onClick={() => setMode('signup')}>Sign up</button>
      </div>
      <form onSubmit={submit}>
        {mode === 'signup' && <>
          <label>Full name<input value={f.full_name} onChange={set('full_name')} maxLength={100} /></label>
          <label>College name<input value={f.college_name} onChange={set('college_name')} maxLength={150} /></label>
          <label>District<input value={f.district} onChange={set('district')} maxLength={80} /></label>
        </>}
        <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
        <label>Password<input type="password" required minLength={8} value={f.password} onChange={set('password')} /></label>
        {err && <p className="alert" role="alert">{err}</p>}
        {msg && <p className="notice" role="status">{msg}</p>}
        <button className="btn primary wide" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
      </form>
    </div>
  )
}
