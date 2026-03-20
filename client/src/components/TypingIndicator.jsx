import './TypingIndicator.css'

export default function TypingIndicator() {
  return (
    <div className="message bot">
      <div className="msg-avatar">&#x1F9E0;</div>
      <div className="msg-content">
        <div className="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  )
}
