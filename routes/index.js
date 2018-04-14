const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');
const path = require('path');
const moment = require('moment');
const dataform = require('../models/database');
const User = dataform.User;
const Group = dataform.Group;
const _Event = dataform._Event;
const appfile = require('../app');
const app = appfile.app;
const sessionChecker = appfile.sessionChecker;
const connectionString = (process.argv[2] === 'local') ? 'postgres://localhost:5432/coleelam' : process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: (process.argv[2] === 'local') ? false : true,
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Eventem' });
});

router.get('/signup', function (req, res) {
  res.render('signup', { title: 'Eventem' });
});

router.post('/signup', function (req, res) {
  const data = { username: req.body.username, email: req.body.email, pass_hash: req.body.pass_hash };
  User.create({
    username: data.username,
    email: data.email,
    pass_hash: data.pass_hash,
  }).then(user => {
    req.session.user = user.dataValues;
    res.redirect('/dashboard');
  }).catch(err => {
    console.log(err);
    res.redirect('/signup');
  });
});

router.get('/login', function (req, res) {
  res.render('login', { title: 'Eventem' });
});

router.post('/login', function (req, res) {
  const data = { username: req.body.username, pass_hash: req.body.pass_hash };
  console.log(data);
  User.findOne({where: {username : data.username}}).then(function (user) {
    if (!user) {
      res.redirect('/login');
    } else if (!user.validPassword(data.pass_hash)) {
      res.redirect('/login');
    } else {
      req.session.user = user.dataValues;
      res.redirect('/dashboard');
    }
  });
});

router.get('/dashboard', function (req, res) {
  if (req.session.user && req.cookies.user_sid) {
    res.render('dashboard', { title: 'Eventem' });
  } else {
    res.redirect('/login');
  }
});

router.get('/logout', function (req, res) {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
