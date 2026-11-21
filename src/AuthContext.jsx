import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

// NOTE: `profile.role` is only used to show/hide menus. The database enforces real permissions (RLS).
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (uid) => {
    if (!uid) { setProfile(null); return }
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
      if (error) throw error
      setProfile(data)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let active = true
    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!active) return
        setSession(data.session)
        await loadProfile(data.session?.user.id)
      } catch {
        if (active) {
          setSession(null)
          setProfile(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    initialize()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      setTimeout(() => loadProfile(s?.user.id), 0)
    })
    return () => { active = false; sub.subscription.unsubscribe() }
  }, [loadProfile])

  const value = {
    session, user: session?.user ?? null, profile, loading,
    refreshProfile: () => loadProfile(session?.user.id),
    signOut: () => supabase.auth.signOut(),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
