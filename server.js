require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); 

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// 🚨 Security Middleware TEMPORARILY REMOVED for stable deployment 🚨

// --- API Routes ---

// GET: Fetch all opportunities (Public Access)
app.get('/api/opportunities', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM opportunities ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing GET query:', error);
        res.status(500).json({ message: 'Failed to retrieve opportunities.' });
    }
});

// POST: Create a new opportunity (TEMPORARILY PUBLIC ACCESS)
app.post('/api/opportunities', async (req, res) => {
    // The 'secret' key is now ignored, making this route publicly accessible.
    const { title, type, deadline, link, location } = req.body; 

    try {
        const result = await pool.query(
            'INSERT INTO opportunities (title, type, deadline, link, location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, type, deadline, link, location]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error executing POST query:', error);
        res.status(500).json({ message: 'Failed to create opportunity.' });
    }
});

// DELETE route is removed to ensure stability.

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});