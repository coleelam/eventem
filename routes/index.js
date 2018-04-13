const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');
const path = require('path');
// const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/coleelam';
const connectionString = 'postgres://localhost:5432/coleelam';

// const client = new pg.Client(connectionString);
const pool = new Pool({
  connectionString: connectionString,
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Eventem' });
});

router.post('/api/users', (req, res, next) => {
  // Grab data from http request
  const data = {username: req.body.username, email: req.body.email, pass_hash: req.body.pass_hash };
  // Get a Postgres client from the connection pool
  console.log(data);
  console.log(connectionString);
  pool.query('INSERT INTO users (username, email, pass_hash) values($1, $2, $3)',
    [data.username, data.email, data.pass_hash], (err, res) => {
    if (err) {
      throw err
    }
  });
});

router.get('/api/users', (req, res, next) => {
  pool.query('SELECT user_id, username, email FROM users ORDER BY id ASC', (err, res) => {
    if (err) {
      throw err
    }
    console.log(res.rows);
    return res.rows;
  });
});


module.exports = router;
