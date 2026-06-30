CREATE TABLE IF NOT EXISTS vk_integrations (
  id SERIAL PRIMARY KEY,
  bot_id INTEGER NOT NULL REFERENCES bots(id),
  group_id BIGINT NOT NULL,
  group_name VARCHAR(255) DEFAULT '',
  access_token TEXT NOT NULL,
  secret_key VARCHAR(100) DEFAULT '',
  confirm_code VARCHAR(100) DEFAULT '',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vk_integrations_bot_id ON vk_integrations(bot_id);
CREATE INDEX IF NOT EXISTS idx_vk_integrations_group_id ON vk_integrations(group_id);

CREATE TABLE IF NOT EXISTS vk_sessions (
  id SERIAL PRIMARY KEY,
  vk_user_id BIGINT NOT NULL,
  bot_id INTEGER NOT NULL REFERENCES bots(id),
  current_node_id VARCHAR(100) DEFAULT '',
  vars JSONB DEFAULT '{}',
  awaiting_email BOOLEAN DEFAULT FALSE,
  collected_name VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vk_sessions_user_bot ON vk_sessions(vk_user_id, bot_id);
