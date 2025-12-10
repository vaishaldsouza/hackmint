// Load environment variables from .env file
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware Setup ---
// Enable CORS for your frontend domain (replace with your Vercel domain later)
const corsOptions = {
    origin: '*', // Allows all origins for development, secure this later
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use(cors(corsOptions));

// Enable parsing of incoming JSON data
app.use(express.json());

// --- 1. Basic Health Check Route (for testing deployment) ---
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: "HackMint Alerts API is running!",
        environment: process.env.NODE_ENV || 'development'
    });
});

// --- 2. Opportunities Route Placeholder ---
// This is where all your Hackathon/Internship API logic will go
app.get('/api/opportunities', (req, res) => {
    // Simulating database fetch for now
    const dummyOpportunities = [
        { id: 1, title: "Global Codeathon 2026", type: "Hackathon", deadline: "2026-03-15" },
        { id: 2, title: "Data Analyst Internship", type: "Internship", deadline: "2026-01-30" }
    ];
    res.status(200).json(dummyOpportunities);
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});