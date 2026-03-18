import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, getMe } from '../api/personal'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('aria_personal_token')
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('aria_personal_token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await apiLogin({ email, password })
    localStorage.setItem('aria_personal_token', data.access_token)
    setUser(data.user)
    return data
  }

  const register = async (email, password, display_name) => {
    const data = await apiRegister({ email, password, display_name })
    localStorage.setItem('aria_personal_token', data.access_token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('aria_personal_token')
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
