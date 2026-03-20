const express = require('express')
const { getProjectsByUser, getProjectById, createProject, updateProjectStep } = require('../db/queries')
const { requireAuth } = require('../middleware/session')

const router = express.Router()

// GET /api/projects
router.get('/', requireAuth, (req, res) => {
  const projects = getProjectsByUser(req.user.id)
  res.json({ projects })
})

// POST /api/projects
router.post('/', requireAuth, (req, res) => {
  const { title, description, project_type, plan, total_steps, is_legacy } = req.body
  if (!title) return res.status(400).json({ error: 'Title is required' })

  const project = createProject(req.user.id, { title, description, project_type, plan, total_steps, is_legacy })
  res.json({ project })
})

// GET /api/projects/:id
router.get('/:id', requireAuth, (req, res) => {
  const project = getProjectById(req.params.id)
  if (!project || project.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Project not found' })
  }
  res.json({ project })
})

// PUT /api/projects/:id/step
router.put('/:id/step', requireAuth, (req, res) => {
  const project = getProjectById(req.params.id)
  if (!project || project.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Project not found' })
  }

  const { step } = req.body
  if (step === undefined) return res.status(400).json({ error: 'Step is required' })

  const updated = updateProjectStep(project.id, step)
  res.json({ project: updated })
})

module.exports = router
