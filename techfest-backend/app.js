// Express application (kept separate from server.js so tests can import it
// without opening a port or connecting to MongoDB).
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const logger = require("./middleware/logger");
const mongoSanitize = require("./middleware/sanitize");
const errors = require("./middleware/errorHandler");

const app = express();

// Render / Netlify sit in front of the app as proxies. This lets Express see
// the real client IP (for rate limiting) and the original https protocol.
app.set("trust proxy", Number(process.env.TRUST_PROXY || 1));

// ---------- Security middleware ----------

// Helmet: sets security headers (Content-Security-Policy, X-Content-Type-Options,
// Strict-Transport-Security, X-Frame-Options, Referrer-Policy, ...).
app.use(helmet());

// CORS: only our own frontend may call the API with cookies.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

// Limit the size of JSON bodies to stop very large payloads.
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Remove keys starting with "$" or containing "." (NoSQL injection).
app.use(mongoSanitize);

// gzip responses (performance).
app.use(compression());

app.use(logger);

// Slow down password guessing on login/register.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" }
});

// ---------- Routes ----------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/registrations", require("./routes/registrations"));
app.use("/api/feedback", require("./routes/feedback"));

app.use(errors.notFound);
app.use(errors.errorHandler);

module.exports = app;
