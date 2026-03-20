import { buildAdaptationSection } from './adaptationPrompt.js'

// --- Auth token management ---
function getToken() {
  return localStorage.getItem('auth_token')
}

function setToken(token) {
  localStorage.setItem('auth_token', token)
}

function clearToken() {
  localStorage.removeItem('auth_token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/'
    throw new Error('Session expired')
  }

  return res
}

// --- Auth ---
export async function login(email, name) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  })
  const data = await res.json()
  if (data.token) setToken(data.token)
  return data
}

export async function getSession() {
  const token = getToken()
  if (!token) return null
  try {
    const res = await apiFetch('/api/auth/session')
    const data = await res.json()
    return data.user || null
  } catch {
    return null
  }
}

export async function logout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' })
  } catch { /* ignore */ }
  clearToken()
}

// --- Profile ---
export async function getProfile() {
  const res = await apiFetch('/api/profile')
  const data = await res.json()
  return data.profile
}

export async function updateProfile(profileData) {
  const res = await apiFetch('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  })
  const data = await res.json()
  return data.profile
}

// --- Messages ---
export async function getMessages(projectId) {
  const res = await apiFetch(`/api/chat/${projectId}/messages`)
  const data = await res.json()
  return data.messages || []
}

export async function saveMessage(projectId, messageData) {
  await apiFetch(`/api/chat/${projectId}/messages`, {
    method: 'POST',
    body: JSON.stringify(messageData),
  })
}

export async function clearMessages(projectId) {
  await apiFetch(`/api/chat/${projectId}/messages`, { method: 'DELETE' })
}

// --- Projects ---
export async function getProjects() {
  const res = await apiFetch('/api/projects')
  const data = await res.json()
  return data.projects
}

export async function createProject(projectData) {
  const res = await apiFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  })
  const data = await res.json()
  return data.project
}

export async function getProject(id) {
  const res = await apiFetch(`/api/projects/${id}`)
  const data = await res.json()
  return data.project
}

export async function updateProjectStep(id, step) {
  const res = await apiFetch(`/api/projects/${id}/step`, {
    method: 'PUT',
    body: JSON.stringify({ step }),
  })
  const data = await res.json()
  return data.project
}

// --- Claude AI ---
function buildSystemPrompt(currentStep, steps, profile) {
  return `You are an interactive project guide helping someone build a data analysis portfolio project analyzing the "Sleep Health and Lifestyle Dataset" from Kaggle. The dataset has 374 rows with columns: Person ID, Gender, Age, Occupation, Sleep Duration, Quality of Sleep (1-10), Physical Activity Level (minutes/day), Stress Level (1-10), BMI Category, Blood Pressure, Heart Rate, Daily Steps, Sleep Disorder (None/Insomnia/Sleep Apnea).

The project has 7 steps: 1) Environment Setup, 2) Data Cleaning, 3) EDA, 4) Deep-Dive Analysis, 5) Dashboard, 6) Stakeholder Memo, 7) Polish & Publish.

Current step: ${currentStep >= 0 ? currentStep + 1 : 'not started'} (${currentStep >= 0 ? steps[currentStep].title : 'intro'}).

Keep responses focused, practical, and concise. Include code snippets when helpful. Format with HTML tags (p, strong, code, pre, ul, li, ol). Do not use markdown. Stay on topic — this is about the sleep analysis project. If they ask something unrelated, gently redirect.` + buildAdaptationSection(profile)
}

export async function postChat(userText, conversationHistory, currentStep, steps, profile) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: buildSystemPrompt(currentStep, steps, profile),
      messages: [
        ...conversationHistory.slice(-6),
        { role: 'user', content: userText },
      ],
    }),
  })

  const data = await response.json()
  return data.content?.map(b => b.text || '').join('') ||
    "I couldn't process that. Try asking about a specific step or type 'next' to continue."
}

export async function postChatWithImages(userText, images, conversationHistory, currentStep, steps, profile) {
  const systemPrompt = buildSystemPrompt(currentStep, steps, profile) + `

The user has shared a screenshot. Analyze it in the context of their sleep analysis project. If it's code, check for errors or suggest improvements. If it's a chart or visualization, give feedback on clarity, design, labeling, and what insight it communicates. If it's an error message, help debug it. If it's a dashboard, evaluate the layout and suggest improvements. If it's something else, describe what you see and relate it to the project where possible.`

  const contentBlocks = [
    ...images.map(img => ({
      type: 'image',
      source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
    })),
    { type: 'text', text: userText },
  ]

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        ...conversationHistory.slice(-4),
        { role: 'user', content: contentBlocks },
      ],
    }),
  })

  const data = await response.json()
  return data.content?.map(b => b.text || '').join('') ||
    "I couldn't analyze that image. Try uploading a clearer screenshot or ask a specific question about it."
}

// --- Discovery ---
export async function postDiscovery(message, conversationHistory) {
  const res = await apiFetch('/api/ai/discovery', {
    method: 'POST',
    body: JSON.stringify({ message, conversationHistory }),
  })
  return res.json()
}

// --- Recommendations ---
export async function getRecommendations() {
  const res = await apiFetch('/api/ai/recommendations', { method: 'POST' })
  return res.json()
}

export async function selectProject(recommendation) {
  const res = await apiFetch('/api/ai/select-project', {
    method: 'POST',
    body: JSON.stringify({ recommendation }),
  })
  return res.json()
}

// --- Generic Claude call (caller provides system prompt) ---
export async function postChatCustom(systemPrompt, messages) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  })
  const data = await response.json()
  return data.content?.map(b => b.text || '').join('') || "I couldn't process that."
}
