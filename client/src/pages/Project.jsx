import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Chat from '../components/Chat.jsx'
import { getStepContent } from '../utils/stepContent.js'
import { processInput } from '../utils/inputHandler.js'
import {
  postChat, postChatWithImages, postChatCustom,
  getProject, updateProjectStep,
  getMessages, saveMessage, clearMessages,
} from '../utils/api.js'
import { buildAdaptationSection } from '../utils/adaptationPrompt.js'
import './Project.css'

const LEGACY_STEPS = [
  { title: "Environment Setup", desc: "Tools & data download" },
  { title: "Data Cleaning", desc: "Prepare & transform" },
  { title: "Exploratory Analysis", desc: "Distributions & patterns" },
  { title: "Deep-Dive Analysis", desc: "Key questions answered" },
  { title: "Dashboard", desc: "Interactive visuals" },
  { title: "Stakeholder Memo", desc: "Business communication" },
  { title: "Polish & Publish", desc: "GitHub & interview prep" },
]

function buildProjectSystemPrompt(project, steps, stepIndex, profile) {
  const stepLines = steps.map((s, i) => `${i + 1}. ${s.title} — ${s.desc}`).join('\n')
  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null
  return `You are a portfolio project mentor guiding someone through building their ${project.project_type} project.

Project: ${project.title}
Description: ${project.description || ''}
${currentStep
    ? `\nCurrent step: ${stepIndex + 1}/${steps.length} — ${currentStep.title}${currentStep.rationale ? `\nWhat to accomplish: ${currentStep.rationale}` : ''}`
    : '\nProject not started yet.'}

Full plan:
${stepLines}

Respond using HTML tags (p, strong, code, pre, ul, li). Keep responses concise. Stay on topic. If the user shares a screenshot, analyze it in the context of the project and current step.` + buildAdaptationSection(profile)
}

export default function Project({ profile }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [planSteps, setPlanSteps] = useState(null)
  const [projectLoading, setProjectLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(-1)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const initialized = useRef(false)
  // Keep a ref to current project id for use in callbacks
  const projectIdRef = useRef(null)
  const currentStepRef = useRef(-1)

  useEffect(() => {
    currentStepRef.current = currentStep
  }, [currentStep])

  useEffect(() => {
    if (!id) { navigate('/'); return }

    getProject(id)
      .then(async p => {
        if (!p) { navigate('/'); return }

        projectIdRef.current = p.id
        setProject(p)

        if (!p.is_legacy && p.plan) {
          try {
            setPlanSteps(typeof p.plan === 'string' ? JSON.parse(p.plan) : p.plan)
          } catch {
            console.error('Failed to parse project plan')
          }
        }

        // Restore existing messages from DB
        try {
          const saved = await getMessages(p.id)
          if (saved.length > 0) {
            setMessages(saved.map(m => ({
              content: m.content,
              type: m.role === 'user' ? 'user' : 'bot',
              actions: null,
            })))
            setConversationHistory(saved.map(m => ({
              role: m.role,
              content: m.raw_content || m.content,
            })))
            setCurrentStep(p.current_step ?? -1)
            initialized.current = true
          }
        } catch {
          // Non-fatal: just start fresh
        }

        setProjectLoading(false)
      })
      .catch(() => navigate('/'))
  }, [id, navigate])

  const steps = project?.is_legacy ? LEGACY_STEPS : (planSteps || [])

  // Fire-and-forget message save (non-blocking)
  function persistMsg(role, content, rawContent, stepIdx, hasImages = 0) {
    const pid = projectIdRef.current
    if (!pid) return
    saveMessage(pid, {
      role,
      content,
      raw_content: rawContent,
      step_index: stepIdx,
      has_images: hasImages,
    }).catch(() => {})
  }

  const addBotMessage = useCallback((content, actions = null) => {
    setMessages(prev => [...prev, { content, type: 'bot', actions }])
  }, [])

  const addUserMessage = useCallback((content) => {
    setMessages(prev => [...prev, { content: `<p>${content}</p>`, type: 'user', actions: null }])
  }, [])

  const deliverStep = useCallback(async (stepIndex) => {
    if (!project) return
    setIsTyping(true)
    if (project.is_legacy) {
      const responses = getStepContent(stepIndex)
      for (let i = 0; i < responses.length; i++) {
        await new Promise(r => setTimeout(r, i === 0 ? 500 : 800))
        const msg = responses[i]
        addBotMessage(msg.content, msg.actions || null)
        persistMsg('assistant', msg.content, msg.content, stepIndex)
      }
    } else if (planSteps) {
      const step = planSteps[stepIndex]
      try {
        const systemPrompt = buildProjectSystemPrompt(project, planSteps, stepIndex, profile)
        const intro = await postChatCustom(systemPrompt, [{
          role: 'user',
          content: `Please introduce step ${stepIndex + 1}: "${step.title}". Explain what I'll be doing, why it matters, and give me a concrete first action to take.`,
        }])
        addBotMessage(intro)
        persistMsg('assistant', intro, intro, stepIndex)
      } catch {
        const fallback = `<p><strong>${step.title}</strong></p><p>${step.rationale}</p>`
        addBotMessage(fallback)
        persistMsg('assistant', fallback, fallback, stepIndex)
      }
    }
    setIsTyping(false)
  }, [project, planSteps, profile, addBotMessage])

  const callClaude = useCallback(async (userText, stepIdx) => {
    setIsTyping(true)
    try {
      let reply
      if (project?.is_legacy) {
        reply = await postChat(userText, conversationHistory, stepIdx, LEGACY_STEPS, profile)
      } else {
        const systemPrompt = buildProjectSystemPrompt(project, planSteps || [], stepIdx, profile)
        reply = await postChatCustom(systemPrompt, [
          ...conversationHistory.slice(-6),
          { role: 'user', content: userText },
        ])
      }
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'assistant', content: reply },
      ])
      addBotMessage(reply)
      persistMsg('assistant', reply, reply, stepIdx)
    } catch {
      addBotMessage(
        `<p>I couldn't connect to the AI service right now. Try asking about a specific step or type 'next' to continue.</p>`,
        ["Next step", "Start over from Step 1"]
      )
    }
    setIsTyping(false)
  }, [conversationHistory, project, planSteps, profile, addBotMessage])

  const handleInput = useCallback(async (text, stepIdx) => {
    if (project?.is_legacy) {
      const result = processInput(text, stepIdx, LEGACY_STEPS)
      if (result.type === 'navigate') {
        const newStep = result.step
        setCurrentStep(newStep)
        updateProjectStep(id, newStep).catch(() => {})
        await deliverStep(newStep)
      } else if (result.type === 'response') {
        addBotMessage(result.content, result.actions)
        persistMsg('assistant', result.content, result.content, stepIdx)
      } else {
        await callClaude(text, stepIdx)
      }
    } else {
      await callClaude(text, stepIdx)
    }
  }, [project, id, deliverStep, addBotMessage, callClaude])

  const handleSendWithImages = useCallback(async (text, images) => {
    const stepIdx = currentStepRef.current
    // Use data URLs (not blob URLs) so images persist on reload
    let userHTML = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">'
    images.forEach(img => {
      const src = `data:${img.mediaType};base64,${img.base64}`
      userHTML += `<img src="${src}" class="msg-image" alt="Uploaded screenshot" style="max-width:200px;border-radius:8px;">`
    })
    userHTML += '</div>'
    if (text) userHTML += `<p>${text}</p>`

    setMessages(prev => [...prev, { content: userHTML, type: 'user', actions: null }])
    persistMsg('user', userHTML, text || '', stepIdx, 1)
    setIsTyping(true)

    try {
      let reply
      if (project?.is_legacy) {
        reply = await postChatWithImages(text, images, conversationHistory, stepIdx, LEGACY_STEPS, profile)
      } else {
        const systemPrompt = buildProjectSystemPrompt(project, planSteps || [], stepIdx, profile) +
          '\n\nThe user has shared a screenshot. Analyze it in context of the project and current step.'
        const contentBlocks = [
          ...images.map(img => ({
            type: 'image',
            source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
          })),
          { type: 'text', text: text || 'Please review this screenshot.' },
        ]
        reply = await postChatCustom(systemPrompt, [
          ...conversationHistory.slice(-4),
          { role: 'user', content: contentBlocks },
        ])
      }
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: (text || '') + ' [attached screenshot]' },
        { role: 'assistant', content: reply },
      ])
      addBotMessage(reply)
      persistMsg('assistant', reply, reply, stepIdx)
    } catch {
      addBotMessage(
        `<p>I couldn't process the image right now. Try again, or describe what's in the screenshot.</p>`,
        ["Next step", "I have an error to debug"]
      )
    }
    setIsTyping(false)
  }, [conversationHistory, project, planSteps, profile, addBotMessage])

  const handleSend = useCallback((text) => {
    const stepIdx = currentStepRef.current
    addUserMessage(text)
    persistMsg('user', `<p>${text}</p>`, text, stepIdx)
    handleInput(text, stepIdx)
  }, [addUserMessage, handleInput])

  const handleQuickAction = useCallback((text, msgIndex) => {
    const stepIdx = currentStepRef.current
    setMessages(prev => prev.map((msg, i) =>
      i === msgIndex ? { ...msg, actions: null } : msg
    ))
    addUserMessage(text)
    persistMsg('user', `<p>${text}</p>`, text, stepIdx)
    handleInput(text, stepIdx)
  }, [addUserMessage, handleInput])

  const handleStepClick = useCallback((stepIndex) => {
    if (isTyping) return
    setCurrentStep(stepIndex)
    updateProjectStep(id, stepIndex).catch(() => {})
    setMessages(prev => prev.map(msg => ({ ...msg, actions: null })))
    deliverStep(stepIndex)
  }, [isTyping, id, deliverStep])

  const handleReset = useCallback(() => {
    setCurrentStep(-1)
    setMessages([])
    setConversationHistory([])
    initialized.current = false
    // Clear from DB
    const pid = projectIdRef.current
    if (pid) {
      clearMessages(pid).catch(() => {})
      updateProjectStep(pid, -1).catch(() => {})
    }
    setTimeout(() => {
      initialized.current = true
      if (project?.is_legacy) {
        addBotMessage(
          `<p>Welcome! I'm your interactive guide for building a <strong>Sleep Quality Analysis</strong> portfolio project.</p>
<p>This project uses the <strong>Sleep Health and Lifestyle Dataset</strong> from Kaggle to answer: <em>What lifestyle factors most strongly predict sleep quality and sleep disorders?</em></p>
<p>By the end, you'll have a complete portfolio piece with a Python notebook, interactive dashboard, and stakeholder memo.</p>
<p>I'll walk you through 7 steps. You can ask me questions at any time, click steps in the sidebar, or just type <strong>"next"</strong> to keep moving.</p>`,
          ["Let's start!", "What does the data look like?", "What tools do I need?"]
        )
      } else {
        addBotMessage(
          `<p>Let's start fresh! Click a step in the sidebar to jump in, or type <strong>"start"</strong> to begin from step 1.</p>`
        )
      }
    }, 100)
  }, [project, addBotMessage])

  // Show welcome message on first load (no existing messages)
  useEffect(() => {
    if (projectLoading || !project || initialized.current) return
    initialized.current = true
    if (project.is_legacy) {
      addBotMessage(
        `<p>Welcome! I'm your interactive guide for building a <strong>Sleep Quality Analysis</strong> portfolio project.</p>
<p>This project uses the <strong>Sleep Health and Lifestyle Dataset</strong> from Kaggle to answer: <em>What lifestyle factors most strongly predict sleep quality and sleep disorders?</em></p>
<p>By the end, you'll have a complete portfolio piece with a Python notebook, interactive dashboard, and stakeholder memo.</p>
<p>I'll walk you through 7 steps. You can ask me questions at any time, click steps in the sidebar, or just type <strong>"next"</strong> to keep moving.</p>`,
        ["Let's start!", "What does the data look like?", "What tools do I need?"]
      )
    } else {
      addBotMessage(
        `<p>Welcome to your <strong>${project.title}</strong> project!</p>
<p>${project.description || ''}</p>
<p>I'll guide you through ${(planSteps || []).length} steps. Click any step in the sidebar to jump in, or type <strong>"start"</strong> to begin from step 1.</p>`,
        ["Let's start from Step 1", "Give me an overview", "What will I build?"]
      )
    }
  }, [projectLoading, project, planSteps, addBotMessage])

  if (projectLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: 'var(--text-muted)',
      }}>
        Loading project...
      </div>
    )
  }

  const projectType = project.project_type
  const subtitle = project.is_legacy
    ? 'Interactive Guide'
    : projectType
      ? projectType.charAt(0).toUpperCase() + projectType.slice(1) + ' Project'
      : 'Project'

  return (
    <div className="app-layout">
      <Sidebar
        title={project.title}
        subtitle={subtitle}
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />
      <Chat
        messages={messages}
        isTyping={isTyping}
        onSend={handleSend}
        onSendWithImages={handleSendWithImages}
        onQuickAction={handleQuickAction}
        onReset={handleReset}
      />
    </div>
  )
}
