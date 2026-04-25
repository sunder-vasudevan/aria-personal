import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, getMe, logoutApi } from '../api/personal'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await apiLogin({ email, password })
    const full = await getMe()
    setUser(full)
    return data
  }

  const register = async (email, password, display_name, referral_code = null, invite_token = null) => {
    const data = await apiRegister({
      email, password, display_name,
      ...(referral_code ? { referral_code } : {}),
      ...(invite_token ? { invite_token } : {}),
    })
    const full = await getMe()
    setUser(full)
    return data
  }

  const logout = async () => {
    await logoutApi()
    setUser(null)
  }

  const refreshUser = async () => {
    const u = await getMe()
    setUser(u)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
