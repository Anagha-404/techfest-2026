import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch, errorText } from "../api";

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/registrations/mine")
      .then(({ ok, data }) => {
        if (ok) setRegistrations(data);
        else setError(errorText(data));
      })
      .catch(() => setError("Could not reach the server."))
      .finally(() => setLoading(false));
  }, []);

  async function cancel(id) {
    const { ok, data } = await apiFetch(`/api/registrations/${id}`, {
      method: "DELETE"
    });

    if (ok) {
      setRegistrations((list) => list.filter((r) => r._id !== id));
    } else {
      setError(errorText(data));
    }
  }

  return (
    <div className="page">
      <h1>My Registrations</h1>

      {loading && <div className="status-box">Loading...</div>}
      {error && <div className="status-box error-msg">{error}</div>}

      {!loading && !error && registrations.length === 0 && (
        <p>
          You have not registered for any event yet.{" "}
          <Link to="/events">Browse events</Link>
        </p>
      )}

      <div className="event-grid">
        {registrations.map((r) => (
          <div className="event-card" key={r._id}>
            <h3>{r.event ? r.event.name : "Event removed"}</h3>
            {r.event && <p>Category: {r.event.category}</p>}
            <p>Registered on {new Date(r.registeredAt).toLocaleDateString()}</p>
            <button type="button" onClick={() => cancel(r._id)}>
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyRegistrations;
