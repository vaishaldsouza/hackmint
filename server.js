require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Get the Admin Secret from the environment variables
const ADMIN_SECRET = process.env.ADMIN_SECRET; 

// Middleware
app.use(cors()); // Allows your Netlify frontend to talk to this Render API
app.use(express.json()); // Allows parsing of JSON request bodies

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// 🚨 Security Middleware: Checks for the Admin Secret Key 🚨
const checkAdminSecret = (req, res, next) => {
    // We expect the secret key to be in the body of POST and DELETE requests
    const { secret } = req.body;

    // Check if the secret is missing or incorrect against the server's environment variable
    if (!secret || secret !== ADMIN_SECRET) {
        return res.status(401).json({ message: 'Unauthorized. Missing or invalid secret key.' });
    }
    
    // Remove the secret from the body before passing it to the database logic
    delete req.body.secret; 
    
    // If the secret is correct, proceed to the next function (the API logic)
    next(); 
};

// --- API Routes ---

// GET: Fetch all opportunities (Public Access)
app.get('/api/opportunities', async (req, res) => {
    try {
        // Order by created_at DESC to show newest first
        const result = await pool.query('SELECT * FROM opportunities ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing GET query:', error);
        res.status(500).json({ message: 'Failed to retrieve opportunities.' });
    }
});

// POST: Create a new opportunity (SECURED by checkAdminSecret)
app.post('/api/opportunities', checkAdminSecret, async (req, res) => {
    // The 'secret' field has already been removed by the middleware
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

// DELETE: Delete an opportunity by ID (SECURED by checkAdminSecret)
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