const jwt = require("jsonwebtoken");

// The JWT now travels in an httpOnly cookie, so page scripts (and any
// injected XSS) cannot read it.
const auth = (req, res, next) => {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Please login first"
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({
      message: "Session expired, please login again"
    });
  }
};

// Use after auth: only admins may continue.
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }
  next();
};

module.exports = auth;
module.exports.adminOnly = adminOnly;
