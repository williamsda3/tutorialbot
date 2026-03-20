import { useState, useRef, useEffect, useCallback } from 'react'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import QuickActions from './QuickActions.jsx'
import ImageLightbox from './ImageLightbox.jsx'
import ImageUpload from './ImageUpload.jsx'
import ImagePreview from './ImagePreview.jsx'
import useImages from '../hooks/useImages.js'
import './Chat.css'

export default function Chat({ messages, isTyping, onSend, onSendWithImages, onQuickAction, onReset }) {
  const [input, setInput] = useState('')
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const chatAreaRef = useRef(null)
  const { pendingImages, addFiles, removeImage, clearImages } = useImages()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Paste support
  useEffect(() => {
    const handlePaste = (e) => {
      const items = Array.from(e.clipboardData?.items || [])
      const imageItems = items.filter(i => i.type.startsWith('image/'))
      if (imageItems.length === 0) return
      e.preventDefault()
      const files = imageItems.map(item => item.getAsFile()).filter(Boolean)
      addFiles(files)
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [addFiles])

  const handleSend = () => {
    const text = input.trim()
    const hasImages = pendingImages.length > 0

    if (!text && !hasImages) return
    if (isTyping) return

    if (hasImages) {
      onSendWithImages(text || "What do you see in this screenshot? Please give me feedback.", [...pendingImages])
      clearImages()
    } else {
      onSend(text)
    }

    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

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

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) addFiles(files)
  }, [addFiles])

  return (
    <div
      ref={chatAreaRef}
      className="chat-area"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={dragOver ? { outline: '2px dashed var(--accent)', outlineOffset: '-4px' } : undefined}
    >
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="bot-avatar">&#x1F9E0;</div>
          <div>
            <h2>Project Guide</h2>
            <span className="status">Online</span>
          </div>
        </div>
        {onReset && <button className="reset-btn" onClick={onReset}>Reset</button>}
      </div>

      <div className="messages-container">
        {messages.map((msg, i) => (
          <div key={i}>
            <MessageBubble
              content={msg.content}
              type={msg.type}
              onImageClick={setLightboxSrc}
            />
            {msg.actions && msg.type === 'bot' && (
              <div style={{ marginLeft: 40, marginBottom: 16 }}>
                <QuickActions
                  actions={msg.actions}
                  onAction={(text) => onQuickAction(text, i)}
                />
              </div>
            )}
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <ImagePreview images={pendingImages} onRemove={removeImage} />
        <div className="input-wrapper">
          <ImageUpload onFiles={addFiles} />
          <textarea
            ref={textareaRef}
            className="input-field"
            placeholder="Ask a question, upload a screenshot, or type 'next'..."
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
        <div className="input-hint">
          Press Enter to send &middot; Shift+Enter for new line &middot; &#x1F4CE; to attach screenshots
        </div>
      </div>

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  )
}
