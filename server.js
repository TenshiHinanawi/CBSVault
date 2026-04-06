// server.js
const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await pool.query('SELECT username FROM users WHERE id = $1', [req.params.id]);
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
    try {
        const results = await pool.query('SELECT * FROM vaults WHERE user_id = $1', [user_id]);
        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const results = await pool.query('SELECT id, username, password_hash, is_admin FROM users');
        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: "Unauthorized" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));