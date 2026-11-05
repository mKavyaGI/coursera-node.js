const express = require('express');
const session = require('express-session');
const publicUsers = require('./router/general.js').general;
const authenticatedUsers = require('./router/auth_users.js').authenticated;

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'express-book-review-session',
  resave: false,
  saveUninitialized: false
}));

app.use('/', publicUsers);
app.use('/customer', publicUsers);
app.use('/customer', authenticatedUsers);

app.listen(port, () => {
  console.log(`Express Book Reviews server listening on port ${port}`);
});

module.exports = app;
