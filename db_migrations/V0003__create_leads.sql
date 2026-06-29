CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  bot_id INTEGER REFERENCES bots(id),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) DEFAULT '',
  phone VARCHAR(100) DEFAULT '',
  extra JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_bot_id ON leads(bot_id);
