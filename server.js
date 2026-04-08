const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.post('/api/calc', (req, res) => {
    try {
        const result = eval(req.body.expr);
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Username and password required" });
    try {
        const hashed = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, hashed]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505')
            return res.status(409).json({ error: "Username already taken" });
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Username and password required" });
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1', [username]
        );
        if (result.rows.length === 0)
            return res.status(401).json({ error: "Invalid credentials" });

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match)
            return res.status(401).json({ error: "Invalid credentials" });

        res.json({ id: user.id, username: user.username, is_admin: user.is_admin });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await pool.query(
            'SELECT id, username FROM users WHERE id = $1', [req.params.id]
        );
        if (user.rows.length > 0) {
            res.json(user.rows[0]);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/vaults', async (req, res) => {
    const { user_id } = req.query;
    if (!user_id)
        return res.status(400).json({ error: "user_id required" });
    try {
        const results = await pool.query(
            'SELECT * FROM vaults WHERE user_id = $1', [user_id]
        );
        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.post('/api/vaults', async (req, res) => {
    const { user_id, site_name, site_username, site_password } = req.body;
    if (!user_id || !site_name || !site_username || !site_password)
        return res.status(400).json({ error: "All fields required" });
    try {
        const result = await pool.query(
            'INSERT INTO vaults (user_id, site_name, site_username, site_password) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, site_name, site_username, site_password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
