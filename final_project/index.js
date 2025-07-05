const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Use session for customer routes
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// JWT Authentication Middleware for protected routes
app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.session.authorization?.accessToken;

  if (!token) {
    return res.status(403).json({ message: "Access token missing" });
  }

  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
});

// Routing
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
