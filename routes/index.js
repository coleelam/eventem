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
const User_Event = dataform.User_Event;
const Sequelize = require('sequelize');

const connectionString = (process.argv[2] === 'local') ? 'postgres://localhost:5432/coleelam' : process.env.DATABASE_URL;

var sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: ((process.argv[2] === 'local')) ? false : true,
  }
});

// const pool = new Pool({
//   connectionString: connectionString,
//   ssl: (process.argv[2] === 'local') ? false : true,
// });

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
      User_Event.findAll({where: {user_id: req.session.user.user_id}}).then(attendings => {
        const attending_events = [];
        const ae = [];
        attendings.forEach(function(attend) {
          attending_events.push((_Event.findOne({where: {event_id : attend.event_id}}).then(aevent => {
              ae.push(aevent.dataValues);
            })
          ));
        });
        Promise.all(attending_events).then(() => {
          res.render('dashboard', { events: events, username: user.username, attending_events: ae });
        });
      });
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
    event_location: req.body.event_location,
  };
  const username = req.session.user.username;
  _Event.create({
    event_name: data.event_name,
    creator: data.creator,
    description: data.description,
    event_time: data.event_time,
    attendees: data.attendees,
    event_location: data.event_location,
  }).then(value => {
    User_Event.create({
      user_id: data.creator,
      event_id: value.dataValues.event_id,
    }).then(user_event => {
      _Event.findAll({where: {creator: data.creator}}).then(events => {
        User_Event.findAll({where: {user_id: data.creator}}).then(attendings => {
          const attending_events = [];
          const ae = [];
          attendings.forEach(function(attend) {
            attending_events.push((_Event.findOne({where: {event_id : attend.event_id}}).then(aevent => {
                ae.push(aevent.dataValues);
              })
            ));
          });
          Promise.all(attending_events).then(() => {
            res.render('dashboard', { events: events, username: data.username, attending_events: ae });
          });
        });
      });
    }).catch(error => {
      console.log(error);
      res.redirect('/dashboard');
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

router.get('/events', function (req, res) {
  if (req.session.user && req.cookies.user_sid) {
    const user = req.session.user;
    sequelize.query('select events.*, users.username from events left join users on events.creator = users.user_id where group_id is null order by events.event_time asc',
     { type : sequelize.QueryTypes.SELECT }).then(events => {
       res.render('events', {events : events, username: user.username, moment: moment})
     });
  } else {
    res.redirect('/login');
  }
});

router.get('/events/:event_id', function (req, res) {
  if (req.session.user && req.cookies.user_sid) {
    // console.log(req.params.event_id);
    _Event.findOne({where: {event_id : req.params.event_id}}).then(event_ => {
      // console.log(event_.dataValues);
      User.findOne({where: {user_id: event_.creator}}).then(user => {
        const data = Object.assign({username: user.username, event_time_formatted: moment(event_.event_time).format('MMMM Do YYYY, h:mm a')}, event_.dataValues);
        data.current_user = req.session.user.user_id;
        res.json(data);
      });
    });
  } else {
    res.redirect('/login');
  }
});

router.post('/dashboard/deleteevent/:event_id', function (req, res) {
  if (req.session.user && req.cookies.user_sid) {
    User_Event.destroy({where : {event_id: req.params.event_id}}).then(() => {
      _Event.destroy({where: {event_id: req.params.event_id}}).then(() => {
        res.redirect('/dashboard');
      });
    });

  } else {
    res.redirect('/login');
  }
});

router.post('/dashboard/removeuser/:event_id', function(req, res) {
  if (req.session.user && req.cookies.user_sid) {
    _Event.findOne({where: {event_id : req.params.event_id}}).then(event_ => {
      const attendees = event_.dataValues.attendees;
      const target = attendees.indexOf(req.session.user.user_id);
      attendees.splice(target, 1);
      event_.update(
        {attendees: attendees},
      ).then(value => {
        User_Event.destroy({where : {user_id: req.session.user.user_id, event_id: req.params.event_id}}).then(() => {
          res.redirect('/dashboard');
        });
      });
    });
  } else {
    res.redirect('/login');
  }
});

router.post('/events/removeuser/:event_id', function(req, res) {
  if (req.session.user && req.cookies.user_sid) {
    _Event.findOne({where: {event_id : req.params.event_id}}).then(event_ => {
      const attendees = event_.dataValues.attendees;
      const target = attendees.indexOf(req.session.user.user_id);
      attendees.splice(target, 1);
      event_.update(
        {attendees: attendees},
      ).then(value => {
        User_Event.destroy({where : {user_id: req.session.user.user_id, event_id: req.params.event_id}}).then(() => {
          res.redirect('/events');
        });
      });
    });
  } else {
    res.redirect('/login');
  }
});

router.post('/dashboard/:event_id', function(req, res) {
  if (req.session.user && req.cookies.user_sid) {
    _Event.update(
      {attendees: sequelize.fn('array_append', sequelize.col('attendees'), req.session.user.user_id)},
      {where: {event_id: req.params.event_id}}
    ).then(value => {
      User_Event.create({user_id: req.session.user.user_id, event_id: req.params.event_id}).then(() => {
        res.redirect('/dashboard');
      });
    });
  } else {
    res.redirect('/login');
  }
});

router.post('/events/:event_id', function(req, res) {
  if (req.session.user && req.cookies.user_sid) {
    _Event.update(
      {attendees: sequelize.fn('array_append', sequelize.col('attendees'), req.session.user.user_id)},
      {where: {event_id: req.params.event_id}}
    ).then(value => {
      User_Event.create({user_id: req.session.user.user_id, event_id: req.params.event_id}).then(() => {
        res.redirect('/events');
      });
    });
    // _Event.findOne({where: {event_id : req.params.event_id}}).then(event_ => {
    //   event_.update({attendees: event_.attendees.push(req.session.user.user_id)}).then((value) => {
    //     console.log(value);
    //     res.redirect('/events');
    //   });
    // });
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
