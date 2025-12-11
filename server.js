require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
// CRITICAL: Use the PORT provided by the environment
const PORT = process.env.PORT || 3000;

// Get the Admin Secret from the environment variables
const ADMIN_SECRET = process.env.ADMIN_SECRET; 

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

// 🚨 Security Middleware: Checks for the Admin Secret Key 🚨
const checkAdminSecret = (req, res, next) => {
    // The secret must be in the request body for POST/DELETE
    const { secret } = req.body;

    // Check if the secret is missing or incorrect
    if (!secret || secret !== ADMIN_SECRET) {
        // Sends 401 Unauthorized status code
        return res.status(401).json({ message: 'Unauthorized. Missing or invalid secret key.' });
    }
    
    // Remove the secret key before passing the request to the API logic
    delete req.body.secret; 
    
    // Proceed to the API route handler
    next(); 
};

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

// POST: Create a new opportunity (SECURED)
app.post('/api/opportunities', checkAdminSecret, async (req, res) => {
    // The 'secret' field is removed by the middleware
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

// DELETE: Delete an opportunity by ID (SECURED)
app.delete('/api/opportunities/:id', checkAdminSecret, async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'DELETE FROM opportunities WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Opportunity not found.' });
        }

        res.status(200).json({ message: 'Opportunity deleted successfully.', deleted: result.rows[0] });

    } catch (error) {
        console.error('Error executing DELETE query:', error);
        res.status(500).json({ message: 'Failed to delete opportunity.' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});