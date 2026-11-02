import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, errorText } from "../api";
import { useAuth } from "../context/AuthContext";

function EventCard({ event }) {
  const [seatsLeft, setSeatsLeft] = useState(event.seats);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const registerEvent = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setBusy(true);

    try {
      const { ok, status, data } = await apiFetch("/api/registrations", {
        method: "POST",
        body: JSON.stringify({ eventId: event._id })
      });

      if (ok) {
        setSeatsLeft(data.seatsLeft);
        setMessage("Registered!");
      } else if (status === 401) {
        navigate("/login");
      } else {
        setMessage(errorText(data));
      }
    } catch {
      setMessage("Server error, try again");
    } finally {
      setBusy(false);
    }
  };

  const soldOut = seatsLeft <= 0;

  return (
    <div className="event-card">
      <h3>{event.name}</h3>

      <p>Category: {event.category}</p>

      <p>Fee: Rs. {event.fee}</p>

      <p>{soldOut ? "SOLD OUT" : `Seats Left: ${seatsLeft}`}</p>

      <button type="button" onClick={registerEvent} disabled={soldOut || busy}>
        {soldOut ? "Sold Out" : busy ? "Registering..." : "Register"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default EventCard;
