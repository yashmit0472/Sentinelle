import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    })

    localStorage.setItem('sentinelle_token', data.token)
    setUser(data.user)

    return data
  }

  const logout = () => {
    localStorage.removeItem('sentinelle_token')
    setUser(null)
  }

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem('sentinelle_token')

      if (!token) {
        setLoading(false)
        return
      }

      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch (error) {
      localStorage.removeItem('sentinelle_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)