// Load environment variables from .env file (for local development only)
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import the database connection and table creation function
const { query, createOpportunitiesTable } = require('./db/index'); 

// --- Configuration ---
const PORT = process.env.PORT || 5000;
const app = express();

// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// --- Routes ---

// 1. Root Route (Health Check)
app.get('/', (req, res) => {
    res.status(200).json({
        message: "HackMint Alerts API is running!",
        environment: process.env.NODE_ENV || 'development'
    });
});

// 2. Opportunities Route (CRITICAL: Database Connection Test)
app.get('/api/opportunities', async (req, res) => {
    try {
        // Execute a simple SQL query to test the connection (SELECT NOW())
        const result = await query('SELECT NOW()');

        // If the query succeeds, we know the DB is connected and the table exists.
        res.status(200).json({
            message: "Database connection successful! Table created.",
            dbTime: result.rows[0].now,
        });
        
    } catch (error) {
        // This will now run if the connection fails (e.g., DB is down, wrong URL)
        console.error('Database connection failed:', error.message);
        res.status(500).json({ 
            message: "Failed to connect to the database. Check logs for details.",
            error: error.message
        });
    }
});


// --- Start Server ---
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // CRITICAL: Call the function to ensure the table is created 
    await createOpportunitiesTable(); 
    
    console.log(`Access at: http://localhost:${PORT}`);
});