module.exports = (req, res, next) => {
  // Jest sets NODE_ENV=test; keep test output clean.
  if (process.env.NODE_ENV !== "test") {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url}`
    );
  }
  next();
};
