const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regdUsers = express.Router();
const users = [];

const isValid = (username) => users.some((user) => user.username === username);

const authenticatedUser = (username, password) =>
  users.some((user) => user.username === username && user.password === password);

regdUsers.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid login credentials' });
  }

  const accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({
    message: 'Customer successfully logged in',
    token: accessToken
  });
});

regdUsers.use((req, res, next) => {
  if (req.session.authorization) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
});

regdUsers.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }
  if (!review) {
    return res.status(400).json({ message: 'Review text is required as a query parameter' });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: `The review for the book with ISBN ${isbn} has been added/updated.`,
    reviews: books[isbn].reviews
  });
});

regdUsers.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: 'No review by this user found for this book' });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`
  });
});

module.exports.authenticated = regdUsers;
module.exports.isValid = isValid;
module.exports.users = users;
