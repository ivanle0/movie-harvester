const express = require('express');
const mysql = require('mysql2');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;

app.use(express.static('public'));

// Create database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// TMDB API Key
const API_KEY = process.env.TMDB_API_KEY;


// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});