const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Simulate async fetchBooks function returning all books
const fetchBooks = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
};

// Task 6: Register a new user (sync)
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Task 10: Get the list of all books (async/await)
public_users.get('/', async function (req, res) {
  try {
    const data = await fetchBooks();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11: Get book details based on ISBN (async/await)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const data = await fetchBooks();

    if (data[isbn]) {
      return res.status(200).json(data[isbn]);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Task 12: Get book details based on author (async/await)
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const data = await fetchBooks();
    const matchingBooks = [];

    for (const key in data) {
      if (data[key].author === author) {
        matchingBooks.push({ isbn: key, ...data[key] });
      }
    }

    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Task 13: Get book details based on title (async/await)
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const data = await fetchBooks();
    const matchingBooks = [];

    for (const key in data) {
      if (data[key].title === title) {
        matchingBooks.push({ isbn: key, ...data[key] });
      }
    }

    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Task 5: Get book review (sync)
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
