import { useState, useEffect, useCallback } from 'react'
import * as api from '../utils/api.js'

export default function useProfile() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSession().then(u => {
      setUser(u)
      if (u) {
        api.getProfile().then(p => {
          setProfile(p)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })
  }, [])

  const login = useCallback(async (email, name) => {
    const data = await api.login(email, name)
    setUser(data.user)
    const p = await api.getProfile()
    setProfile(p)
    return data
  }, [])

  const logout = useCallback(async () => {
    await api.logout()
    setUser(null)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    const p = await api.getProfile()
    setProfile(p)
    return p
  }, [])

  return { user, profile, loading, login, logout, refreshProfile }
}
