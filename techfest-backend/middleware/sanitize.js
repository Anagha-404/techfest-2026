const { sanitize } = require("express-mongo-sanitize");

// app.use(mongoSanitize()) from express-mongo-sanitize crashes on Express 5,
// because req.query is read-only there. So we call its sanitize() helper on
// the parts of the request our routes read: body and params.
//
// Example attack it stops:  { "email": { "$ne": null }, "password": "x" }
// becomes                   { "email": {}, "password": "x" }
module.exports = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  next();
};
