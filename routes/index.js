const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/coleelam';

const client = new pg.Client(connectionString);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Eventem' });
});

router.post('/api/users', (req, res, next) => {
  const results = [];
  // Grab data from http request
  // console.log(req.body);
  const data = {username: req.body.username, email: req.body.email, pass_hash: req.body.pass_hash };
  // Get a Postgres client from the connection pool
  client.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO users (username, email, pass_hash) values($1, $2, $3)',
    [data.username, data.email, data.pass_hash]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM users ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});


module.exports = router;
