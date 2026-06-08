import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchOrg(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchOrg(session.user.id)
      else { setOrg(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchOrg(userId) {
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    setOrg(data)
    setLoading(false)
  }

  async function signUp(email, password) {
    return supabase.auth.signUp({ email, password })
  }

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshOrg(userId) {
    await fetchOrg(userId)
  }

  return (
    <AuthContext.Provider value={{ user, org, loading, signUp, signIn, signOut, refreshOrg }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
