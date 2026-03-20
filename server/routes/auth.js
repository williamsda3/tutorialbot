const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { findUserByEmail, createUser, createProfile, createSession, getSession, getUserById, deleteSession } = require('../db/queries')
const { requireAuth } = require('../middleware/session')

const router = express.Router()

// POST /api/auth/login — find or create user, create session
router.post('/login', (req, res) => {
  const { email, name } = req.body
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' })
  }

  let user = findUserByEmail(email.toLowerCase().trim())
  if (!user) {
    user = createUser(email.toLowerCase().trim(), name.trim())
    createProfile(user.id)
  }

  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  createSession(sessionId, user.id, expiresAt)

  res.json({ token: sessionId, user })
})

// GET /api/auth/session — validate current session
router.get('/session', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    deleteSession(authHeader.slice(7))
  }
  res.json({ ok: true })
})

module.exports = router
