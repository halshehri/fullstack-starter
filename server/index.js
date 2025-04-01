require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Railway's SSL setup
  }
});

// Get last 5 timestamps
app.get('/api/calls', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM calls_history
      ORDER BY call_timestamp DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/calls error:', err);
    res.status(500).send('Server error');
  }
});

// Insert a new timestamp
app.post('/api/calls', async (req, res) => {
  try {
    await pool.query(`INSERT INTO calls_history DEFAULT VALUES`);
    res.json({ success: true, message: 'Timestamp logged successfully' });
  } catch (err) {
    console.error('POST /api/calls error:', err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
