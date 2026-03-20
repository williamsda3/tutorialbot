const { getDb } = require('./setup')

// --- Users ---
function createUser(email, name) {
  const db = getDb()
  const result = db.prepare('INSERT INTO users (email, name) VALUES (?, ?)').run(email, name)
  return getUserById(result.lastInsertRowid)
}

function findUserByEmail(email) {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
}

function getUserById(id) {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
}

// --- Profiles ---
function createProfile(userId) {
  const db = getDb()
  db.prepare('INSERT OR IGNORE INTO profiles (user_id) VALUES (?)').run(userId)
  return getProfile(userId)
}

function getProfile(userId) {
  const db = getDb()
  return db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId)
}

function updateProfile(userId, data) {
  const db = getDb()
  const fields = []
  const values = []

  for (const [key, value] of Object.entries(data)) {
    if (['target_role', 'industry_interest', 'skills', 'experience_level',
         'experience_detail', 'comfort_preference', 'discovery_complete', 'raw_discovery'].includes(key)) {
      fields.push(`${key} = ?`)
      values.push(typeof value === 'object' ? JSON.stringify(value) : value)
    }
  }

  if (fields.length === 0) return getProfile(userId)

  fields.push("updated_at = datetime('now')")
  values.push(userId)

  db.prepare(`UPDATE profiles SET ${fields.join(', ')} WHERE user_id = ?`).run(...values)
  return getProfile(userId)
}

// --- Projects ---
function createProject(userId, { title, description, project_type, plan, total_steps, is_legacy }) {
  const db = getDb()
  const result = db.prepare(
    `INSERT INTO projects (user_id, title, description, project_type, plan, total_steps, is_legacy)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userId, title, description || null, project_type || null,
    typeof plan === 'object' ? JSON.stringify(plan) : plan,
    total_steps || 7, is_legacy || 0
  )
  return getProjectById(result.lastInsertRowid)
}

function getProjectsByUser(userId) {
  const db = getDb()
  return db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC').all(userId)
}

function getProjectById(id) {
  const db = getDb()
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id)
}

function updateProjectStep(id, step) {
  const db = getDb()
  db.prepare("UPDATE projects SET current_step = ?, updated_at = datetime('now') WHERE id = ?").run(step, id)
  return getProjectById(id)
}

// --- Messages ---
function createMessage(projectId, { role, content, raw_content, step_index, has_images, image_data }) {
  const db = getDb()
  const result = db.prepare(
    `INSERT INTO messages (project_id, role, content, raw_content, step_index, has_images, image_data)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    projectId, role, content, raw_content || null, step_index ?? null,
    has_images || 0, image_data ? JSON.stringify(image_data) : null
  )
  return db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid)
}

function getMessagesByProject(projectId) {
  const db = getDb()
  return db.prepare('SELECT * FROM messages WHERE project_id = ? ORDER BY created_at ASC').all(projectId)
}

function clearMessages(projectId) {
  const db = getDb()
  db.prepare('DELETE FROM messages WHERE project_id = ?').run(projectId)
}

function getRecentMessages(projectId, limit = 20) {
  const db = getDb()
  return db.prepare(
    'SELECT * FROM messages WHERE project_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(projectId, limit).reverse()
}

// --- Sessions ---
function createSession(sessionId, userId, expiresAt) {
  const db = getDb()
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(sessionId, userId, expiresAt)
  return { id: sessionId, user_id: userId, expires_at: expiresAt }
}

function getSession(sessionId) {
  const db = getDb()
  return db.prepare(
    "SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  ).get(sessionId)
}

function deleteSession(sessionId) {
  const db = getDb()
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
}

function deleteExpiredSessions() {
  const db = getDb()
  db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run()
}

module.exports = {
  createUser, findUserByEmail, getUserById,
  createProfile, getProfile, updateProfile,
  createProject, getProjectsByUser, getProjectById, updateProjectStep,
  createMessage, getMessagesByProject, getRecentMessages, clearMessages,
  createSession, getSession, deleteSession, deleteExpiredSessions,
}
