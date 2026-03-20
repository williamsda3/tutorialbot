const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

let db

function getDb() {
  if (db) return db

  const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  db = new Database(path.join(dataDir, 'portfoliobot.db'))
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  createTables()
  return db
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      target_role TEXT,
      industry_interest TEXT,
      skills TEXT,
      experience_level TEXT,
      experience_detail TEXT,
      comfort_preference TEXT,
      discovery_complete INTEGER DEFAULT 0,
      raw_discovery TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      project_type TEXT,
      plan TEXT,
      current_step INTEGER DEFAULT 0,
      total_steps INTEGER DEFAULT 7,
      status TEXT DEFAULT 'active',
      is_legacy INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      raw_content TEXT,
      step_index INTEGER,
      has_images INTEGER DEFAULT 0,
      image_data TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)
}

module.exports = { getDb }
