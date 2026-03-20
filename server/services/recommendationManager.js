const fs = require('fs')
const path = require('path')
const { callClaude, extractText } = require('./claude')

const recommendationPrompt = fs.readFileSync(
  path.join(__dirname, '../../prompts/recommendation.md'), 'utf-8'
)

const planGeneratorPrompt = fs.readFileSync(
  path.join(__dirname, '../../prompts/plan-generator.md'), 'utf-8'
)

function buildProfileSummary(profile) {
  const skills = (() => {
    try { return JSON.parse(profile.skills) } catch { return profile.skills }
  })()

  return `Target role: ${profile.target_role || 'not specified'}
Industry interest: ${profile.industry_interest || 'not specified'}
Skills: ${Array.isArray(skills) ? skills.join(', ') : skills || 'not specified'}
Experience level: ${profile.experience_level || 'beginner'}
Experience detail: ${profile.experience_detail || 'not specified'}
Comfort preference: ${profile.comfort_preference || 'achievable'}`
}

async function generateRecommendations(profile) {
  const response = await callClaude({
    system: recommendationPrompt,
    messages: [
      { role: 'user', content: `User profile:\n${buildProfileSummary(profile)}\n\nGenerate project recommendations.` },
    ],
    max_tokens: 2000,
  })

  const text = extractText(response).trim()

  // Strip markdown code fences if present
  const json = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  try {
    return JSON.parse(json)
  } catch {
    throw new Error('Failed to parse recommendations from Claude response')
  }
}

async function generatePlan(project, profile) {
  const skills = (() => {
    try { return JSON.parse(profile.skills) } catch { return profile.skills }
  })()

  const userMessage = `Project to plan:
Title: ${project.title}
Description: ${project.pitch || project.description}
Type: ${project.project_type}
Tech stack: ${project.tech_stack || 'not specified'}
Deliverable: ${project.deliverable || 'not specified'}

User profile:
Experience level: ${profile.experience_level || 'beginner'}
Skills: ${Array.isArray(skills) ? skills.join(', ') : skills || 'not specified'}

Generate a step-by-step plan for this project.`

  const response = await callClaude({
    system: planGeneratorPrompt,
    messages: [{ role: 'user', content: userMessage }],
    max_tokens: 1500,
  })

  const text = extractText(response).trim()
  const json = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  try {
    return JSON.parse(json)
  } catch {
    throw new Error('Failed to parse plan from Claude response')
  }
}

module.exports = { generateRecommendations, generatePlan }
