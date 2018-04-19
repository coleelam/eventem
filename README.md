# Eventem

---

# Group Members

| Name | Email |
| :---: | :---- |
| Cole Elam | elamc@purdue.edu |

# Description

Eventem is an app that is designed to bring all event registration to a single app and allow people to sign up for those events with event management functionality.

# Dependencies

* Node.js - Server-side javascript
* Express.js - Web application framework
* EJS - Embedded JavaScript in HTML
* Angular JS - HTTP Requests
* Heroku - Cloud platform for web application deployment
* PostgreSQL - Database for users/user auth/events/etc.
* Sequelize - Node ORM for Databases (connecting to PostgreSQL Database)
* cookie-parser - manage user sessions when logged in
* bcrypt - blowfish encryption algorithm for encrypting user data to ensure security

# Development

* Install dependencies, get the latest version of Node.js, Express.js, and Heroku toolbelt.

* Update to latest version of project.
```bash
git pull
```

* Login with Heroku
```bash
heroku login
```

* Install dependencies for server
```bash
npm install
```

* After updating any files, check locally using
```bash
node ./bin/www
```

* To push to live server, do
```bash
git commit -am "relevant comment"
git push origin master
git push heroku master
```

* To check it out at the live site
```bash
heroku open
```
