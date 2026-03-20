import ProgressTracker from './ProgressTracker.jsx'
import './Sidebar.css'

export default function Sidebar({ title, subtitle, steps, currentStep, onStepClick }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <ProgressTracker currentStep={currentStep} totalSteps={steps.length} />
      <div className="steps-nav">
        {steps.map((step, i) => {
          let className = 'step-item'
          if (i < currentStep) className += ' completed'
          if (i === currentStep) className += ' active'

          return (
            <div key={i} className={className} onClick={() => onStepClick(i)}>
              <div className="step-number">
                {i < currentStep ? null : <span>{i + 1}</span>}
              </div>
              <div className="step-info">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
