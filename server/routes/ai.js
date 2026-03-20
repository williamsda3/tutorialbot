const express = require('express')
const { callClaude } = require('../services/claude')
const { processMessage } = require('../services/discoveryManager')
const { generateRecommendations, generatePlan } = require('../services/recommendationManager')
const { updateProfile, getProfile, createProject } = require('../db/queries')
const { requireAuth } = require('../middleware/session')

const router = express.Router()

// POST /api/ai/chat — proxy to Claude API
router.post('/chat', async (req, res) => {
  try {
    const data = await callClaude(req.body)
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message || 'Failed to reach Anthropic API' })
  }
})

// POST /api/ai/discovery — discovery conversation
router.post('/discovery', requireAuth, async (req, res) => {
  const { message, conversationHistory } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const exchangeCount = Math.floor((conversationHistory || []).length / 2)

  try {
    const result = await processMessage(message, conversationHistory || [], exchangeCount)

    if (result.profileComplete && result.profileData) {
      const profileUpdate = {
        ...result.profileData,
        skills: Array.isArray(result.profileData.skills)
          ? JSON.stringify(result.profileData.skills)
          : result.profileData.skills,
        discovery_complete: 1,
        raw_discovery: JSON.stringify([
          ...(conversationHistory || []),
          { role: 'user', content: message },
          { role: 'assistant', content: result.rawReply },
        ]),
      }
      updateProfile(req.user.id, profileUpdate)
    }

    res.json({
      reply: result.reply,
      profileComplete: result.profileComplete,
      profileData: result.profileData,
    })
  } catch (err) {
    res.status(502).json({ error: err.message || 'Discovery failed' })
  }
})

// POST /api/ai/recommendations — generate project recommendations from profile
router.post('/recommendations', requireAuth, async (req, res) => {
  try {
    const profile = getProfile(req.user.id)
    if (!profile) {
      return res.status(400).json({ error: 'Profile not found — complete discovery first' })
    }

    const recommendations = await generateRecommendations(profile)
    res.json({ recommendations })
  } catch (err) {
    res.status(502).json({ error: err.message || 'Failed to generate recommendations' })
  }
})

// POST /api/ai/select-project — user picks a recommendation; generate plan and create project
router.post('/select-project', requireAuth, async (req, res) => {
  const { recommendation } = req.body

  if (!recommendation) {
    return res.status(400).json({ error: 'Recommendation is required' })
  }

  try {
    const profile = getProfile(req.user.id)
    const plan = await generatePlan(recommendation, profile)

    const project = createProject(req.user.id, {
      title: recommendation.title,
      description: recommendation.pitch,
      project_type: recommendation.project_type,
      plan: plan,
      total_steps: plan.length,
      is_legacy: 0,
    })

    res.json({ project })
  } catch (err) {
    res.status(502).json({ error: err.message || 'Failed to create project' })
  }
})

module.exports = router
