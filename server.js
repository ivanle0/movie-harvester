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

// Genre Map
const genreMap = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

// Get Genre Names from Genre IDs
const getGenreNames = (genre_ids) => {
  if (!Array.isArray(genre_ids) || genre_ids.length === 0) return 'Unknown';
  const genreNames = genre_ids.map(id => genreMap[id] || 'Unknown');
  return genreNames.join(', ');
};

// Fetch movies from TMDB API for a given year
const fetchMoviesFromAPI = async (year) => {
  try {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_year=${year}&language=en-US&page=1`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (err) {
    console.error('Error fetching from TMDB API:', err);
    return [];
  }
};

// GET /api/movies/:year endpoint
app.get('/api/movies/:year', async (req, res) => {
  const { year } = req.params;

  // Validate year input
  if (isNaN(year) || year < 1930 || year > 2030) {
    return res.status(400).json({ error: 'Invalid year provided' });
  }

  try {
    pool.query('SELECT * FROM movies WHERE year = ?', [year], async (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Database query error' });
      }

      if (results.length > 0) {
        console.log(`Movies found in DB for year ${year}.`);
        return res.status(200).json(results);
      }

      console.log(`No movies in DB for year ${year}. Fetching from TMDB...`);
      const movies = await fetchMoviesFromAPI(year);
      if (!movies.length) {
        return res.status(404).json({ message: 'No movies found for this year.' });
      }

      // Insert movies into DB and wait until all movies are inserted
      const insertPromises = movies.map(movie => {
        const title = movie.title;
        const genre_ids = movie.genre_ids;
        const genre = getGenreNames(genre_ids);
        const tmdb_id = movie.id;
        return new Promise((resolve, reject) => {
          pool.query(
            'INSERT INTO movies (title, year, genre, tmdb_id, owned) VALUES (?, ?, ?, ?, ?)',
            [title, year, genre, tmdb_id || '', 0],
            (insertErr) => {
              if (insertErr) {
                console.error('Error inserting movie into DB:', insertErr);
                return reject(insertErr);
              }
              resolve();
            }
          );
        });
      });

      try {
        await Promise.all(insertPromises);
        console.log(`Inserted ${movies.length} movies into DB for year ${year}.`);
        return res.status(200).json(movies);
      } catch (insertError) {
        console.error('Error inserting some movies:', insertError);
        return res.status(500).json({ error: 'Error inserting movies into database' });
      }
    });
  } catch (error) {
    console.error('Unhandled error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});