const { Pool } = require('pg');

// Render automatically sets the DATABASE_URL environment variable 
// which contains the secure connection string.
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    // Add SSL configuration required for secure connection to Render's DB
    ssl: {
        rejectUnauthorized: false
    }
});

// A wrapper function to execute queries for simplicity
const query = (text, params) => {
    return pool.query(text, params);
};

// Function to create the Opportunities table if it doesn't exist
const createOpportunitiesTable = async () => {
    const opportunitiesTableQuery = `
        CREATE TABLE IF NOT EXISTS opportunities (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL, -- e.g., 'Hackathon', 'Internship'
            deadline DATE,
            link TEXT NOT NULL,
            location VARCHAR(100),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await query(opportunitiesTableQuery);
        console.log('✅ Opportunities table ensured to exist.');
    } catch (err) {
        console.error('❌ Error creating opportunities table:', err);
    }
};

module.exports = {
    query,
    createOpportunitiesTable, // Export the setup function for server.js
};