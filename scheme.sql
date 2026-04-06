-- schema.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE vaults (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    site_name VARCHAR(100),
    site_username VARCHAR(100),
    site_password TEXT
);

INSERT INTO users (username, password_hash, is_admin) VALUES 
('admin', 'admin123_hash', true),
('bob', 'password555', false),
('alice', 'alice_secret_99', false);

INSERT INTO vaults (user_id, site_name, site_username, site_password) VALUES 
(1, 'Corporate_VPN', 'admin', 'SuperSecretAdminPass123'),
(2, 'Facebook', 'bob_cool', 'monkey123'),
(3, 'Banking', 'alice_jones', 'P@ssword2024!');