// Backend: Node.js + Express + PostgreSQL
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Admin Authentication
app.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).send('Admin not found');

    const isMatch = await bcrypt.compare(password, result.rows[0].password);
    if (!isMatch) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ adminId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get All Drivers
app.get('/drivers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers');
    res.json(result.rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Add a New Driver
app.post('/add-driver', async (req, res) => {
  const { name, experience, language, score, photo } = req.body;
  try {
    await pool.query('INSERT INTO drivers (name, experience, language, score, photo) VALUES ($1, $2, $3, $4, $5)', [name, experience, language, score, photo]);
    res.send('Driver added successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update GoKonnect Score
app.put('/update-score', async (req, res) => {
  const { driverId, score } = req.body;
  try {
    await pool.query('UPDATE drivers SET score = $1 WHERE id = $2', [score, driverId]);
    res.send('Score updated successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(5000, () => {
  console.log('Backend running on port 5000');
}); 

app.get("/", (req, res) => {
    res.send("GoKonnect Backend is Running!");
});

// Deployment Instructions
// - Frontend: Deploy via Vercel
// - Backend: Deploy on Railway.app
// - Database: PostgreSQL on Neon.tech

// Admin Panel Usage Guide
// - Login to Admin Panel
// - Add/Edit drivers with photos
// - Update GoKonnect scores
// - Manage bookings & users
// - Adjust pricing & view payments
// - Security & troubleshooting
