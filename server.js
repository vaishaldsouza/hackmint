// Load environment variables from .env file (for local development only)
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import the database functions
const { 
    query, 
    createOpportunitiesTable, 
    insertOpportunity, 
    getOpportunities 
} = require('./db/index'); 

// --- Configuration ---
const PORT = process.env.PORT || 5000;
const app = express();

// --- Middleware ---
// 🚨 CRITICAL: These must be BEFORE any app.post() or app.get() routes
app.use(cors()); 
app.use(express.json()); // This allows Express to read incoming JSON POST bodies

// --- Routes ---

// 1. Root Route (Health Check)
app.get('/', (req, res) => {
    res.status(200).json({
        message: "HackMint Alerts API is running!",
        environment: process.env.NODE_ENV || 'development'
    });
});

// 2. POST /api/opportunities: Inserts a new opportunity
app.post('/api/opportunities', async (req, res) => {
    // Basic validation
    const { title, type, link } = req.body;
    if (!title || !type || !link) {
        return res.status(400).json({ 
            message: "Missing required fields: title, type, and link are mandatory." 
        });
    }

    try {
        // Use the function from db/index.js to insert the data
        const newOpportunity = await insertOpportunity(req.body); 

        res.status(201).json({
            message: "Opportunity added successfully!",
            opportunity: newOpportunity 
        });

    } catch (error) {
        console.error('Error in POST /api/opportunities:', error.message);
        res.status(500).json({ 
            message: "Failed to insert opportunity into database.",
            error: error.message
        });
    }
});


// 3. GET /api/opportunities: Fetches all active opportunities
app.get('/api/opportunities', async (req, res) => {
    try {
        // Use the function from db/index.js to fetch data
        const opportunities = await getOpportunities(); 
        
        // Return the array of opportunities (even if empty)
        res.status(200).json(opportunities);
        
    } catch (error) {
        console.error('Error in GET /api/opportunities:', error.message);
        res.status(500).json({ 
            message: "Failed to fetch opportunities from database.",
            error: error.message
        });
    }
});


// --- Start Server ---
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Ensure the table is created on server startup
    await createOpportunitiesTable(); 
    
    console.log(`Access at: http://localhost:${PORT}`);
});