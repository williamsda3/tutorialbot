import './MessageBubble.css'

export default function MessageBubble({ content, type, onImageClick }) {
  if (type === 'bot') {
    return (
      <div className="message bot">
        <div className="msg-avatar">&#x1F9E0;</div>
        <div
          className="msg-content"
          dangerouslySetInnerHTML={{ __html: content }}
          onClick={(e) => {
            if (e.target.classList.contains('msg-image') && onImageClick) {
              onImageClick(e.target.src)
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="message user">
      <div
        className="msg-content"
        dangerouslySetInnerHTML={{ __html: content }}
        onClick={(e) => {
          if (e.target.classList.contains('msg-image') && onImageClick) {
            onImageClick(e.target.src)
          }
        }}
      />
    </div>
  )
}
