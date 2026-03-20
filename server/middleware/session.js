const { getSession, getUserById } = require('../db/queries')

// Strategy: database token lookup
// Reads Bearer token from Authorization header, looks up session in DB
function dbTokenStrategy(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  const session = getSession(token)
  if (!session) return null

  const user = getUserById(session.user_id)
  return user || null
}

// TODO: OAuth strategy
// To add OAuth (Google, GitHub), implement a strategy function with the same signature:
//   function oauthStrategy(req) { ... return user or null }
// Then add it to the strategies array below.
// The middleware will try each strategy in order until one resolves a user.
// Downstream routes only see req.user — they don't know which strategy authenticated.

const strategies = [dbTokenStrategy]

function sessionMiddleware(req, res, next) {
  req.user = null

  for (const strategy of strategies) {
    const user = strategy(req)
    if (user) {
      req.user = user
      break
    }
  }

  next()
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  next()
}

module.exports = { sessionMiddleware, requireAuth }
