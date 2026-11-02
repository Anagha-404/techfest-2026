const express = require("express");
const { body } = require("express-validator");

const Feedback = require("../models/Feedback");
const validate = require("../middleware/validate");

const router = express.Router();

// Latest feedback (shown on the Contact page)
router.get("/", async (req, res) => {
  const feedback = await Feedback.find()
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(feedback);
});

// Add feedback. The text is stored as-is; the React page must show it as
// plain text (never with dangerouslySetInnerHTML) so <script> cannot run.
router.post(
  "/",
  [
    body("name").optional({ values: "falsy" }).isString().trim()
      .isLength({ max: 50 }).withMessage("Name is too long"),
    body("message").isString().trim().isLength({ min: 1, max: 500 })
      .withMessage("Message must be 1-500 characters")
  ],
  validate,
  async (req, res) => {
    const feedback = await Feedback.create({
      name: req.body.name || undefined,
      message: req.body.message
    });

    res.status(201).json(feedback);
  }
);

module.exports = router;
