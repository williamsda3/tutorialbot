const express = require('express')
const { getProjectById, createMessage, getMessagesByProject, getRecentMessages, clearMessages } = require('../db/queries')
const { requireAuth } = require('../middleware/session')

const router = express.Router()

// GET /api/chat/:projectId/messages
router.get('/:projectId/messages', requireAuth, (req, res) => {
  const project = getProjectById(req.params.projectId)
  if (!project || project.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Project not found' })
  }

  const messages = getMessagesByProject(project.id)
  res.json({ messages })
})

// POST /api/chat/:projectId/messages
router.post('/:projectId/messages', requireAuth, (req, res) => {
  const project = getProjectById(req.params.projectId)
  if (!project || project.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Project not found' })
  }

  const { role, content, raw_content, step_index, has_images, image_data } = req.body
  if (!role || !content) {
    return res.status(400).json({ error: 'Role and content are required' })
  }

  const message = createMessage(project.id, { role, content, raw_content, step_index, has_images, image_data })
  res.json({ message })
})

// DELETE /api/chat/:projectId/messages
router.delete('/:projectId/messages', requireAuth, (req, res) => {
  const project = getProjectById(req.params.projectId)
  if (!project || project.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Project not found' })
  }
  clearMessages(project.id)
  res.json({ ok: true })
})

module.exports = router
