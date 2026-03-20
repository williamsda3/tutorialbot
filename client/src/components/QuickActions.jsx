import './QuickActions.css'

export default function QuickActions({ actions, onAction }) {
  if (!actions || actions.length === 0) return null

  return (
    <div className="quick-actions">
      {actions.map((action, i) => (
        <button
          key={i}
          className="quick-action-btn"
          onClick={() => onAction(action)}
        >
          {action}
        </button>
      ))}
    </div>
  )
}
