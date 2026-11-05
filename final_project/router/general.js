const express = require('express');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');
const axios = require('axios');

const publicUsers = express.Router();

publicUsers.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: 'User already exists!' });
  }

  users.push({ username, password });
  return res.status(200).json({
    message: 'Customer successfully registered. Now you can login'
  });
});

publicUsers.get('/', (req, res) => res.status(200).send(JSON.stringify({ books }, null, 4)));

publicUsers.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book
    ? res.status(200).json(book)
    : res.status(404).json({ message: 'Book not found' });
});

publicUsers.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const matchedBooks = Object.values(books).filter((book) => book.author.toLowerCase() === author);
  return matchedBooks.length
    ? res.status(200).json({ booksbyauthor: matchedBooks })
    : res.status(404).json({ message: 'No books found by this author' });
});

publicUsers.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const matchedBooks = Object.values(books).filter((book) => book.title.toLowerCase() === title);
  return matchedBooks.length
    ? res.status(200).json({ booksbytitle: matchedBooks })
    : res.status(404).json({ message: 'No books found with this title' });
});

publicUsers.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book
    ? res.status(200).json(book.reviews)
    : res.status(404).json({ message: 'Book not found' });
});

publicUsers.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching book list', error: error.message });
  }
});

publicUsers.get('/async/isbn/:isbn', (req, res) => {
  axios.get(`http://localhost:5000/isbn/${req.params.isbn}`)
    .then((response) => res.status(200).json(response.data))
    .catch((error) => res.status(404).json({ message: 'Book not found', error: error.message }));
});

publicUsers.get('/async/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: 'Author not found', error: error.message });
  }
});

publicUsers.get('/async/title/:title', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${req.params.title}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: 'Title not found', error: error.message });
  }
});

module.exports.general = publicUsers;
