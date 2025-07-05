const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check if username/password are correct
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Task 7: Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Task 8: Add or update review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please login first." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

// Task 9: Delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please login first." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const userReviews = books[isbn].reviews;

  if (userReviews[username]) {
    delete userReviews[username];
    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: userReviews
    });
  } else {
    return res.status(404).json({ message: "No review found from this user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
