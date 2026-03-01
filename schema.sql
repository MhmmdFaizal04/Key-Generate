-- Keys Table
CREATE TABLE IF NOT EXISTS keys (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Redirect Links Table
CREATE TABLE IF NOT EXISTS redirect_links (
  id SERIAL PRIMARY KEY,
  server_name VARCHAR(20) NOT NULL UNIQUE,
  label VARCHAR(50) NOT NULL,
  shortlink_url TEXT NOT NULL,
  callback_url TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shortlinks Table (legacy structure for standard settings if needed)
CREATE TABLE IF NOT EXISTS shortlinks (
  id SERIAL PRIMARY KEY,
  server_name VARCHAR(20) NOT NULL UNIQUE,
  shortlink_url TEXT NOT NULL,
  target_token VARCHAR(100) NOT NULL UNIQUE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Access Tokens Table (for verifying shortlink passes)
CREATE TABLE IF NOT EXISTS access_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(200) NOT NULL UNIQUE,
  server_id INTEGER REFERENCES redirect_links(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  used BOOLEAN DEFAULT false
);

-- Optional Seed Data for Redirect Links (3 standard servers)
INSERT INTO redirect_links (server_name, label, shortlink_url, callback_url)
VALUES 
  ('server1', 'Server 1 (Fast)', 'https://bicolink.net/ref/Zall', ''),
  ('server2', 'Server 2 (Backup)', 'https://bicolink.net/ref/Zall', ''),
  ('server3', 'Server 3 (VIP)', 'https://bicolink.net/ref/Zall', '')
ON CONFLICT (server_name) DO NOTHING;
