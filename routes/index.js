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
const connectionString = (process.argv[2] === 'local') ? 'postgres://localhost:5432/coleelam' : process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: (process.argv[2] === 'local') ? false : true,
});

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

/* GET home page. */
router.get('/', sessionChecker, function(req, res, next) {
  res.render('login', { title: 'Eventem' });
});

router.get('/signup', sessionChecker, function (req, res) {
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

router.get('/login', sessionChecker, function (req, res) {
  res.render('login', { title: 'Eventem' });
});

router.post('/login', function (req, res) {
  const data = { username: req.body.username, pass_hash: req.body.pass_hash };
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
    const user = req.session.user;
    _Event.findAll({where: {creator: req.session.user.user_id}}).then(events => {
      // console.log(events);
      res.render('dashboard', { events: events, username: user.username });
    });
  } else {
    res.redirect('/login');
  }
});

router.post('/dashboard', function (req, res) {
  const data = {
    creator: req.session.user.user_id,
    event_name: req.body.event_name,
    description: req.body.description,
    event_time: moment(req.body.mdy + ' ' + req.body.hm),
    attendees: [req.session.user.user_id],
    username: req.session.user.username,
  }
  const username = req.session.user.username;
  _Event.create({
    event_name: data.event_name,
    creator: data.creator,
    description: data.description,
    event_time: data.event_time,
    attendees: data.attendees,
  }).then(value => {
    _Event.findAll({where: {creator: data.creator}}).then(events => {
      res.render('dashboard', { events: events, username: data.username });
    });
  }).catch(err => {
    console.log(err);
    res.redirect('/dashboard');
  });
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
