const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: 50,
    default: "Anonymous"
  },

  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
