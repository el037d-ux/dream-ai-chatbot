CREATE TABLE landings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(200) NOT NULL DEFAULT 'Мой лендинг',
    slug VARCHAR(120),
    blocks JSONB NOT NULL DEFAULT '[]',
    theme JSONB NOT NULL DEFAULT '{}',
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_landings_user ON landings(user_id);
CREATE UNIQUE INDEX idx_landings_slug ON landings(slug) WHERE slug IS NOT NULL;