import { useState } from 'react'

export default function LoginForm({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Please enter both your name and email.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onLogin(email.trim(), name.trim())
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: 32,
      padding: 40,
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Portfolio Project Mentor
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Your AI-powered guide to building projects that get you hired.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        width: '100%',
        maxWidth: 360,
      }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
          }}
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
          }}
        />
        {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 32px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--accent)',
            color: 'white',
            fontSize: 15,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'Getting started...' : 'Get Started'}
        </button>
      </form>
    </div>
  )
}
