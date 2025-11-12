-- GAIA v2.1 Week 4 - D1 Schema Initialization

-- users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL
);

-- settings (cloud-backed per user, non-sensitive plaintext JSON)
CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,                -- plaintext JSON string (non-sensitive)
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, key),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- learning_progress (prep for later move)
CREATE TABLE IF NOT EXISTS learning_progress (
  user_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  percent INTEGER DEFAULT 0,
  last_touched INTEGER,
  PRIMARY KEY (user_id, topic),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- academy_results
CREATE TABLE IF NOT EXISTS academy_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  correct_count INTEGER NOT NULL,
  total INTEGER NOT NULL,
  percent INTEGER NOT NULL,
  wrong_tags TEXT,          -- JSON array
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- labs
CREATE TABLE IF NOT EXISTS labs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  tags TEXT,                -- JSON array
  prompt TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- HEALTH TABLES (sensitive data at rest - encrypted before storage)

-- health_conditions
CREATE TABLE IF NOT EXISTS health_conditions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,       -- ENC (client-side encrypted)
  notes TEXT,               -- ENC (client-side encrypted)
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- health_meds
CREATE TABLE IF NOT EXISTS health_meds (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,       -- ENC (client-side encrypted)
  dose TEXT,                -- ENC (e.g., "500 mg", client-side encrypted)
  unit TEXT,                -- ENC or plaintext (mg, ml, etc.)
  schedule TEXT,            -- ENC (JSON: times per day, days of week)
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- health_metrics
CREATE TABLE IF NOT EXISTS health_metrics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date INTEGER NOT NULL,    -- epoch day or ms
  weight REAL,              -- plaintext (not highly sensitive)
  bg_fasting REAL,          -- plaintext or can be encrypted if stricter policy needed
  bg_post REAL,             -- plaintext or can be encrypted
  notes TEXT,               -- ENC (client-side encrypted)
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_results_user_id ON academy_results(user_id);
CREATE INDEX IF NOT EXISTS idx_labs_user_id ON labs(user_id);
CREATE INDEX IF NOT EXISTS idx_health_conditions_user_id ON health_conditions(user_id);
CREATE INDEX IF NOT EXISTS idx_health_meds_user_id ON health_meds(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date ON health_metrics(user_id, date);
