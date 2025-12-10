const { Pool } = require('pg');

// Render sets the DATABASE_URL environment variable automatically
// when we added it to the dashboard.
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    // Add SSL configuration for secure connection to Render's DB
    ssl: {
        rejectUnauthorized: false
    }
});

// A wrapper function to execute queries
const query = (text, params) => {
    // console.log('EXECUTING QUERY:', text); // Uncomment for debugging
    return pool.query(text, params);
};

// Function to create the Opportunities table (Schema Setup)
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
    createOpportunitiesTable, // Export the setup function
};