const express = require("express");
const { body, param } = require("express-validator");

const Registration = require("../models/Registration");
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();


// Register the logged-in user for an event
router.post(
  "/",
  auth,
  body("eventId").isMongoId().withMessage("Invalid event id"),
  validate,
  async (req, res) => {
    const { eventId } = req.body;

    const already = await Registration.findOne({
      user: req.user.id,
      event: eventId
    });

    if (already) {
      return res.status(409).json({
        message: "You are already registered for this event"
      });
    }

    // Take one seat only if a seat is left (atomic, so two users
    // cannot both take the last seat).
    const event = await Event.findOneAndUpdate(
      { _id: eventId, seats: { $gt: 0 } },
      { $inc: { seats: -1 } },
      { returnDocument: "after" }
    );

    if (!event) {
      const exists = await Event.exists({ _id: eventId });
      return exists
        ? res.status(400).json({ message: "Event is sold out" })
        : res.status(404).json({ message: "Event not found" });
    }

    try {
      const registration = await Registration.create({
        user: req.user.id,
        event: eventId
      });

      res.status(201).json({
        message: "Registration successful",
        registration,
        seatsLeft: event.seats
      });
    } catch (err) {
      // give the seat back if saving the registration failed
      await Event.updateOne({ _id: eventId }, { $inc: { seats: 1 } });
      throw err;
    }
  }
);


// View my registrations
router.get("/mine", auth, async (req, res) => {
  const registrations = await Registration.find({ user: req.user.id })
    .populate("event", "name category fee date")
    .sort({ registeredAt: -1 });

  res.json(registrations);
});


// View all registrations (admin only - contains other users' emails)
router.get("/", auth, adminOnly, async (req, res) => {
  const registrations = await Registration.find()
    .populate("user", "name email")
    .populate("event", "name category");

  res.json(registrations);
});


// Cancel one of my registrations
router.delete(
  "/:id",
  auth,
  param("id").isMongoId().withMessage("Invalid registration id"),
  validate,
  async (req, res) => {
    // user: req.user.id stops users from deleting other people's registrations
    const registration = await Registration.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    await Event.updateOne({ _id: registration.event }, { $inc: { seats: 1 } });

    res.json({ message: "Registration cancelled" });
  }
);

module.exports = router;
