import { useState, useRef, useEffect, useCallback } from 'react'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import { postDiscovery } from '../utils/api.js'
import './Chat.css'

const WELCOME_MESSAGE = `<p>Hey! I'm your portfolio project mentor. Before I recommend anything, I'd love to learn a bit about you and what you're working toward.</p>
<p><strong>What kind of role are you aiming for?</strong> (Data analyst, frontend dev, full-stack engineer, or something else entirely — whatever you're going after.)</p>`

export default function DiscoveryChat({ onComplete }) {
  const [messages, setMessages] = useState([
    { content: WELCOME_MESSAGE, type: 'bot' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [profileData, setProfileData] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isTyping) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // Add user message
    setMessages(prev => [...prev, { content: `<p>${text}</p>`, type: 'user' }])
    setIsTyping(true)

    try {
      const result = await postDiscovery(text, conversationHistory)

      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: text },
        { role: 'assistant', content: result.reply },
      ]
      setConversationHistory(newHistory)

      setMessages(prev => [...prev, { content: result.reply, type: 'bot' }])

      if (result.profileComplete && result.profileData) {
        setProfileData(result.profileData)
        // Small delay before showing confirmation
        setTimeout(() => setShowConfirmation(true), 1000)
      }
    } catch {
      setMessages(prev => [...prev, {
        content: '<p>Something went wrong. Could you try that again?</p>',
        type: 'bot',
      }])
    }

    setIsTyping(false)
  }, [input, isTyping, conversationHistory])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="chat-area" style={{ maxWidth: 800, margin: '0 auto', height: '100vh' }}>
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="bot-avatar">&#x1F9E0;</div>
          <div>
            <h2>Getting to Know You</h2>
            <span className="status">Online</span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, i) => (
          <MessageBubble key={i} content={msg.content} type={msg.type} />
        ))}
        {isTyping && <TypingIndicator />}

        {showConfirmation && profileData && (
          <ProfileConfirmation
            data={profileData}
            onConfirm={onComplete}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {!showConfirmation && (
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              className="input-field"
              placeholder="Tell me about yourself..."
              rows="1"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={isTyping}
            >
              &#x2192;
            </button>
          </div>
          <div className="input-hint">Press Enter to send</div>
        </div>
      )}
    </div>
  )
}

function ProfileConfirmation({ data, onConfirm }) {
  return (
    <div style={{
      animation: 'msgIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      margin: '20px 0',
      padding: '20px 24px',
      borderRadius: 14,
      border: '1px solid var(--green)',
      background: 'var(--green-bg)',
    }}>
      <p style={{ fontWeight: 600, color: 'var(--green)', marginBottom: 12 }}>
        Here's what I've got:
      </p>
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.target_role && (
          <li><strong style={{ color: 'var(--text-primary)' }}>Target role:</strong> <span style={{ color: 'var(--text-secondary)' }}>{data.target_role}</span></li>
        )}
        {data.industry_interest && (
          <li><strong style={{ color: 'var(--text-primary)' }}>Industry:</strong> <span style={{ color: 'var(--text-secondary)' }}>{data.industry_interest}</span></li>
        )}
        {data.skills && data.skills.length > 0 && (
          <li><strong style={{ color: 'var(--text-primary)' }}>Skills:</strong> <span style={{ color: 'var(--text-secondary)' }}>{Array.isArray(data.skills) ? data.skills.join(', ') : data.skills}</span></li>
        )}
        {data.experience_level && (
          <li><strong style={{ color: 'var(--text-primary)' }}>Level:</strong> <span style={{ color: 'var(--text-secondary)' }}>{data.experience_level}</span></li>
        )}
        {data.experience_detail && (
          <li><strong style={{ color: 'var(--text-primary)' }}>Background:</strong> <span style={{ color: 'var(--text-secondary)' }}>{data.experience_detail}</span></li>
        )}
        {data.comfort_preference && (
          <li><strong style={{ color: 'var(--text-primary)' }}>Preference:</strong> <span style={{ color: 'var(--text-secondary)' }}>{data.comfort_preference === 'stretching' ? 'Wants a challenge' : 'Confidence-building'}</span></li>
        )}
      </ul>
      <button
        onClick={onConfirm}
        style={{
          marginTop: 16,
          padding: '10px 28px',
          borderRadius: 8,
          border: 'none',
          background: 'var(--green)',
          color: 'var(--bg-primary)',
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        Looks good, show me projects!
      </button>
    </div>
  )
}
