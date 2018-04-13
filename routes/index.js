const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');
const path = require('path');
const moment = require('moment');
const connectionString = (process.argv[2] === 'local') ? 'postgres://localhost:5432/coleelam' : process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: (process.argv[2] === 'local') ? false : true,
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Eventem' });
});

/* POST NEW USER ROUTE */
router.post('/api/users', (req, res, next) => {
  // Grab data from http request
  const data = { username: req.body.username, email: req.body.email, pass_hash: req.body.pass_hash };
  // Get a Postgres client from the connection pool
  console.log(data);
  // console.log(connectionString);
  pool.query('INSERT INTO users (username, email, pass_hash) values($1, $2, $3)',
    [data.username, data.email, data.pass_hash], (err, res) => {
    if (err) {
      console.log('Cannot add user because: ' + err);
    }
  });
  res.render('index', { title: 'Eventem' });
});

/* GET LIST OF USERS */
router.get('/api/users', (req, res, next) => {
  pool.query('SELECT user_id, username, email FROM users ORDER BY user_id ASC', (err, res) => {
    if (err) {
      console.log('Cannot SELECT because: ' + err);
    }
    console.log(res.rows);
    return res.rows;
  });
  res.render('index', { title: 'Eventem' });
});

/* POST NEW EVENT */
router.post('/api/events', (req, res, next) => {
  const data = { event_name: req.body.event_name, creator: req.body.creator, event_time: moment().add(3, 'days').format() }
  console.log(data);
  pool.query('INSERT INTO events (event_name, creator, event_time) values($1, $2, $3)',
    [data.event_name, data.creator, data.event_time], (err, res) => {
    if (err) {
      console.log('Cannot add event because: ' + err);
    }
  });
  res.render('index', { title: 'Eventem' });
});

/* GET LIST OF EVENTS */
router.get('/api/events', (req, res, next) => {
  pool.query('SELECT * FROM events ORDER BY event_time ASC', (err, res) => {
    if (err) {
      console.log('Cannot SELECT events because: ' + err);
    }
    console.log(res.rows);
    return res.rows;
  });
  res.render('index', { title: 'Eventem' });
});

/* POST NEW GROUP */
router.post('/api/groups', (req, res, next) => {
  const data = { group_name: req.body.group_name, created_by: req.body.created_by };
  console.log(data);
  pool.query('INSERT INTO groups (group_name, created_by) values($1, $2)',
    [data.group_name, data.created_by], (err, res) => {
    if (err) {
      console.log('Cannot create group because: ' + err);
    }
  });
  res.render('index', { title: 'Eventem' });
});

/* GET GROUPS */
router.get('/api/groups', (req, res, next) => {
  pool.query('SELECT * FROM groups ORDER BY group_name ASC', (err, res) => {
    if (err) {
      console.log('Cannot SELECT groups because: ' + err);
    }
    console.log(res.rows);
  });
  res.render('index', { title: 'Eventem' });
});

module.exports = router;
