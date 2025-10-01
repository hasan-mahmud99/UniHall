import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../lib/mockApi.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(api.getSessionUser())

  useEffect(() => {
    api.ensureSeedData()
  }, [])

  const login = async (email, password) => {
    const u = await api.login(email, password)
    setUser(u)
    return u
  }
  const register = async (payload) => {
    const u = await api.register(payload)
    setUser(u)
    return u
  }
  const logout = () => {
    api.logout()
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, logout, register }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
