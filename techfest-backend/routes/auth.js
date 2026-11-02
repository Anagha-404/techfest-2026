const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");

const User = require("../models/User");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");

const router = express.Router();

// Options for the login cookie:
//  httpOnly - JavaScript in the page cannot read it (protects from XSS theft)
//  secure   - only sent over HTTPS (in production)
//  sameSite - not sent on requests started by other sites (CSRF protection)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.COOKIE_SAMESITE || "strict",
  maxAge: 60 * 60 * 1000 // 1 hour, same as the JWT
};


// Register
router.post(
  "/register",
  [
    body("name").isString().trim().isLength({ min: 2, max: 50 })
      .withMessage("Name must be 2-50 characters"),
    body("email").isEmail().withMessage("Enter a valid email").trim(),
    body("password").isString()
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
      .matches(/[A-Za-z]/).withMessage("Password must contain a letter")
      .matches(/\d/).withMessage("Password must contain a number")
  ],
  validate,
  async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // role is never taken from the request, so nobody can sign up as admin.
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered",
      id: user._id,
      name: user.name,
      email: user.email
    });
  }
);


// Login
router.post(
  "/login",
  [
    // isEmail()/isString() reject objects like { "$ne": null } -> blocks NoSQL injection
    body("email").isEmail().withMessage("Enter a valid email").trim(),
    body("password").isString().notEmpty().withMessage("Password is required")
  ],
  validate,
  async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Same message for wrong email and wrong password (no user enumeration).
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, cookieOptions);

    res.json({
      message: "Login successful",
      user: { name: user.name, email: user.email, role: user.role }
    });
  }
);


// Logout - clear the cookie
router.post("/logout", (req, res) => {
  const { maxAge, ...clearOptions } = cookieOptions;
  res.clearCookie("token", clearOptions);
  res.json({ message: "Logged out" });
});


// Who is logged in? (the frontend cannot read the httpOnly cookie itself)
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("name email role");

  if (!user) {
    return res.status(401).json({ message: "Please login first" });
  }

  res.json({ user });
});

module.exports = router;
