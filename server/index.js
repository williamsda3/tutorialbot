require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')
const { getDb } = require('./db/setup')
const { sessionMiddleware } = require('./middleware/session')

// Initialize database
getDb()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(sessionMiddleware)

// API routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/profile', require('./routes/profile'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/ai', require('./routes/ai'))

// Legacy endpoint — direct Claude proxy (used by client before auth is wired up)
app.post('/api/chat-legacy', async (req, res) => {
  const { callClaude } = require('./services/claude')
  try {
    const data = await callClaude(req.body)
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message || 'Failed to reach Anthropic API' })
  }
})

// In production, serve the built React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
