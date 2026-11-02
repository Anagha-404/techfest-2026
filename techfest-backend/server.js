require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;

// Refuse to start without the secrets the app depends on.
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("MONGO_URI and JWT_SECRET must be set in the environment");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  })
  .catch((err) => {
    console.error("DB error:", err.message);
    process.exit(1);
  });
