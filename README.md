# Big Fun Canvas

---

# Group Members

| Name | Email |
| :---: | :---- |
| Cole Elam | elamc@purdue.edu |
| Jordan Mayer | mayer15@purdue.edu |
| David Sun | sun594@purdue.edu |

# Description

Big Fun Canvas (BFC) is a massive digital canvas that anyone can draw on. To avoid having any one person take over the entire drawing, the canvas is divided into smaller squares called "patches", and users are limited to drawing in one patch per day. To use BFC, simply visit the website, create an account with your own username and password, and enter the coordinates of the patch you want to draw in (or, if you can't decide, BFC can choose for you).

Once you choose a patch, you can draw whatever you want using BFC's wide array of colors, brushes, and shapes. Create your own standalone patch or draw something that responds to or integrates with a neighboring patch. If you want, you can join a Guild of other users who work together to create larger works of art - and perhaps fight for dominance over a certain segment of the canvas.


# Dependencies

* Node.js - Server-side javascript
* Express.js - Web application framework
* EJS - Embedded JavaScript in HTML
* Heroku - Cloud platform for web application deployment
* Socket.IO - Real-time engine for bidirectional events

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
node server.js
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
