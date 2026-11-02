const notFound = (req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
};

const errorHandler = (err, req, res, next) => {
  // Bad ObjectId, e.g. /api/events/abc
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  // Duplicate key (unique index)
  if (err.code === 11000) {
    return res.status(409).json({ message: "Already exists" });
  }

  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON" });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request too large" });
  }

  console.error(err);

  // Never leak internal error details (stack, DB messages) in production.
  res.status(err.status || 500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message
  });
};

module.exports = {
  notFound,
  errorHandler
};
