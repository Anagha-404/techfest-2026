const express = require("express");
const { body, param } = require("express-validator");

const Event = require("../models/Event");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const idRule = param("id").isMongoId().withMessage("Invalid event id");

// optional = true for PUT, where only some fields may be sent
const eventRules = (optional = false) => {
  const field = (name) => (optional ? body(name).optional() : body(name));

  return [
    field("name").isString().trim().isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 characters"),
    field("category").isString().trim().isLength({ min: 2, max: 50 })
      .withMessage("Category is required"),
    field("fee").isInt({ min: 0 }).withMessage("Fee must be 0 or more").toInt(),
    field("seats").isInt({ min: 0 }).withMessage("Seats must be 0 or more").toInt(),
    field("date").isISO8601().withMessage("Date must be a valid date").toDate()
  ];
};

// Copy only known fields, so extra keys in the body are ignored (mass assignment).
const pickEventFields = (data) => {
  const allowed = ["name", "category", "fee", "seats", "date"];
  const result = {};

  allowed.forEach((key) => {
    if (data[key] !== undefined) result[key] = data[key];
  });

  return result;
};


// GET all events
router.get("/", async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

// GET one event
router.get("/:id", idRule, validate, async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.json(event);
});

// POST event (admin)
router.post("/", auth, adminOnly, eventRules(), validate, async (req, res) => {
  const event = await Event.create(pickEventFields(req.body));
  res.status(201).json(event);
});

// PUT event (admin)
router.put(
  "/:id",
  auth,
  adminOnly,
  idRule,
  eventRules(true),
  validate,
  async (req, res) => {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      pickEventFields(req.body),
      { returnDocument: "after", runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  }
);

// DELETE event (admin)
router.delete("/:id", auth, adminOnly, idRule, validate, async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.json({ message: "Event deleted" });
});

module.exports = router;
