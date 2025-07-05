const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username already exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check if username/password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Route: Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT Token
  let accessToken = jwt.sign({ username: username }, "access", { expiresIn: "1h" });

  // Store token in session
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Route: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please login first." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
