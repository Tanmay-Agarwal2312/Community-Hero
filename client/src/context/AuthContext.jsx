import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  async function fetchCurrentUser() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user || data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  function login() {
    window.location.href = '/api/auth/google'
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { credentials: 'include' })
    } catch {
      // proceed regardless
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetchUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
