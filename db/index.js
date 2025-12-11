const { Pool } = require('pg');

// Use the DATABASE_URL environment variable set on Render
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    // SSL configuration required for secure connection to Render's DB
    ssl: {
        rejectUnauthorized: false
    }
});

// Wrapper function to execute queries
const query = (text, params) => {
    return pool.query(text, params);
};

// Function to create the Opportunities table if it doesn't exist
const createOpportunitiesTable = async () => {
    const opportunitiesTableQuery = `
        CREATE TABLE IF NOT EXISTS opportunities (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL, 
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
        throw err;
    }
};

// Function: Insert a single opportunity
const insertOpportunity = async (opportunity) => {
    const { title, type, deadline, link, location } = opportunity;

    const insertQuery = `
        INSERT INTO opportunities (title, type, deadline, link, location)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [title, type, deadline, link, location];

    try {
        const result = await query(insertQuery, values);
        return result.rows[0]; 
    } catch (err) {
        console.error('❌ Error inserting opportunity:', err);
        throw err;
    }
};

// Function: Fetch all active opportunities
const getOpportunities = async () => {
    const selectQuery = `
        SELECT id, title, type, deadline, link, location, created_at
        FROM opportunities
        WHERE is_active = TRUE
        ORDER BY created_at DESC;
    `;
    
    try {
        const result = await query(selectQuery);
        return result.rows; 
    } catch (err) {
        console.error('❌ Error fetching opportunities:', err);
        throw err;
    }
};

module.exports = {
    query,
    createOpportunitiesTable,
    insertOpportunity,
    getOpportunities,
};