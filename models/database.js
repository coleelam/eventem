const pg = require('pg');
const QueryStream = require('pg-query-stream');

const connectionString = ((process.argv[2] === 'local')) ? 'postgres://localhost:5432/coleelam' : process.env.DATABASE_URL;

const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

var sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: ((process.argv[2] === 'local')) ? false : true,
  }
});
// console.log(sequelize);

var User = sequelize.define('users', {
  user_id: {
    type: Sequelize.INTEGER,
    unique: true,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      isEmail: true,
    }
  },
  pass_hash: {
    type: Sequelize.STRING,
    allowNull: false
  }
},
{
  indexes: [
    {
      unique: true,
      fields: ['username', 'email']
    }
  ],
  hooks: {
    beforeCreate: (user) => {
      const salt = bcrypt.genSaltSync();
      user.pass_hash = bcrypt.hashSync(user.pass_hash, salt);
    }
  },
  timestamps: false,
});
User.prototype.validPassword = function (pass_hash) {
  return bcrypt.compareSync(pass_hash, this.pass_hash);
}
var Group = sequelize.define('groups', {
  group_id: {
    type: Sequelize.INTEGER,
    unique: true,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  group_name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  created_by: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'user_id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
    allowNull: false,
  },
  group_members: {
    type: Sequelize.ARRAY(Sequelize.INTEGER),
    allowNull: true,
    defaultValue: [],
  },
}, {
  hooks: {
    afterCreate: (group) => {
      group.group_members.push(group.created_by);
    }
  },
  timestamps: false,
});
var _Event = sequelize.define('events', {
  event_id: {
    type: Sequelize.INTEGER,
    unique: true,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  event_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  creator: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  group_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: null,
    references: {
      model: Group,
      key: 'group_id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
  event_time: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  attendees: {
    type: Sequelize.ARRAY(Sequelize.INTEGER),
    allowNull: true,
    defaultValue: [],
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['event_name', 'creator']
    }
  ],
  timestamps: false,
});

// sequelize.sync()
//   .then(() => console.log('created tables if they didn\'t exist'))
//   .catch(err => console.log('there was an error: ' + err));
//
module.exports = {
  User,
  Group,
  _Event,
}
