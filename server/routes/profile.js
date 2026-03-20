const express = require('express')
const { getProfile, updateProfile } = require('../db/queries')
const { requireAuth } = require('../middleware/session')

const router = express.Router()

// GET /api/profile
router.get('/', requireAuth, (req, res) => {
  const profile = getProfile(req.user.id)
  res.json({ profile })
})

// PUT /api/profile
router.put('/', requireAuth, (req, res) => {
  const profile = updateProfile(req.user.id, req.body)
  res.json({ profile })
})

module.exports = router
