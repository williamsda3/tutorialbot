import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import * as api from '../utils/api.js'

const DIFFICULTY_COLORS = {
  beginner: '#4ade80',
  intermediate: '#facc15',
  advanced: '#f87171',
}

function RecommendationCard({ rec, onStart, starting }) {
  const skills = Array.isArray(rec.skills_demonstrated)
    ? rec.skills_demonstrated
    : []

  return (
    <div style={{
      padding: '20px 24px',
      borderRadius: 12,
      border: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{rec.title}</h3>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: 20,
          background: DIFFICULTY_COLORS[rec.difficulty] + '22',
          color: DIFFICULTY_COLORS[rec.difficulty],
          whiteSpace: 'nowrap',
          textTransform: 'capitalize',
        }}>
          {rec.difficulty}
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec.pitch}</p>

      {rec.why_this_fits && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
          {rec.why_this_fits}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {skills.map(skill => (
          <span key={skill} style={{
            fontSize: 11,
            padding: '3px 8px',
            borderRadius: 20,
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}>
            {skill}
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {rec.tech_stack && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Stack</p>
            <p style={{ fontSize: 12 }}>{rec.tech_stack}</p>
          </div>
        )}
        {rec.timeline && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Timeline</p>
            <p style={{ fontSize: 12 }}>{rec.timeline}</p>
          </div>
        )}
        {rec.deliverable && (
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Deliverable</p>
            <p style={{ fontSize: 12 }}>{rec.deliverable}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => onStart(rec)}
        disabled={starting}
        style={{
          marginTop: 4,
          padding: '10px 20px',
          borderRadius: 8,
          border: 'none',
          background: starting ? 'var(--bg-primary)' : 'var(--accent)',
          color: starting ? 'var(--text-muted)' : '#fff',
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          cursor: starting ? 'default' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {starting ? 'Creating project...' : 'Start this project'}
      </button>
    </div>
  )
}

export default function Home({ user, profile, onLogout }) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState(null)
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [recsError, setRecsError] = useState(null)
  const [startingTitle, setStartingTitle] = useState(null)

  useEffect(() => {
    api.getProjects().then(p => {
      setProjects(p)
      setLoading(false)
    })
  }, [])

  const handleGetRecommendations = async () => {
    setLoadingRecs(true)
    setRecsError(null)
    try {
      const data = await api.getRecommendations()
      setRecommendations(data.recommendations)
    } catch {
      setRecsError('Failed to generate recommendations. Please try again.')
    }
    setLoadingRecs(false)
  }

  const handleSelectProject = async (rec) => {
    setStartingTitle(rec.title)
    try {
      const data = await api.selectProject(rec)
      navigate(`/project/${data.project.id}`)
    } catch {
      setStartingTitle(null)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '40px 20px',
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: 640,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 40,
      }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700 }}>
            Welcome, {user?.name}
          </h1>
          {profile?.target_role && (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
              Targeting: {profile.target_role}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/discovery')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
            }}
          >
            Rediscover
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
            }}
          >
            Log out
          </button>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Existing projects */}
        {!loading && projects.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Projects
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/project/${p.id}`)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{p.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Step {p.current_step + 1} of {p.total_steps} &middot; {p.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {profile?.discovery_complete && (
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Personalized Projects
            </h2>

            {!recommendations && !loadingRecs && (
              <button
                onClick={handleGetRecommendations}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: 10,
                  border: '1px dashed var(--border)',
                  background: 'transparent',
                  color: 'var(--accent)',
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Get personalized project recommendations
              </button>
            )}

            {loadingRecs && (
              <div style={{
                padding: '32px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontSize: 14,
              }}>
                Generating recommendations based on your profile...
              </div>
            )}

            {recsError && (
              <div style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>
                {recsError}{' '}
                <button
                  onClick={handleGetRecommendations}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
                >
                  Try again
                </button>
              </div>
            )}

            {recommendations && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {recommendations.map(rec => (
                  <RecommendationCard
                    key={rec.title}
                    rec={rec}
                    onStart={handleSelectProject}
                    starting={startingTitle === rec.title}
                  />
                ))}
                <button
                  onClick={handleGetRecommendations}
                  style={{
                    padding: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Generate new recommendations
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
