import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import useProfile from './hooks/useProfile.js'
import LoginForm from './components/LoginForm.jsx'
import Home from './pages/Home.jsx'
import Discovery from './pages/Discovery.jsx'
import Project from './pages/Project.jsx'

function App() {
  const { user, profile, loading, login, logout, refreshProfile } = useProfile()
  const navigate = useNavigate()

  // Redirect logic after login
  useEffect(() => {
    if (loading || !user) return
    if (profile && !profile.discovery_complete) {
      navigate('/discovery', { replace: true })
    }
  }, [user, profile, loading, navigate])

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: 'var(--text-muted)',
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <LoginForm onLogin={async (email, name) => {
        await login(email, name)
        navigate('/discovery')
      }} />
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home user={user} profile={profile} onLogout={logout} />} />
      <Route path="/discovery" element={
        <Discovery onComplete={async () => {
          await refreshProfile()
          navigate('/')
        }} />
      } />
      <Route path="/project/:id" element={<Project profile={profile} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
