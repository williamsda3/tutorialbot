import './ProgressTracker.css'

export default function ProgressTracker({ currentStep, totalSteps }) {
  const pct = currentStep < 0 ? 0 : Math.round(((currentStep + 1) / totalSteps) * 100)

  return (
    <div className="progress-section">
      <div className="progress-label">Progress</div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-text">
        Step {Math.max(0, currentStep + 1)} of {totalSteps}
      </div>
    </div>
  )
}
