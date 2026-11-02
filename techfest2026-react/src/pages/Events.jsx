import { useState, useEffect } from "react";
import EventList from "../components/EventList";
import { apiFetch } from "../api";

function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/events")
      .then(({ ok, data }) => {
        if (ok) setEvents(data);
        else setError("Could not load events.");
      })
      .catch(() => setError("Could not reach the server."))
      .finally(() => setLoading(false));
  }, []);

  // Build the dropdown from the categories that actually exist.
  const categories = ["All", ...new Set(events.map((e) => e.category))];

  const filteredEvents = events.filter((event) => {
    const nameMatches = event.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatches =
      category === "All" ||
      event.category === category;

    return nameMatches && categoryMatches;
  });

  return (
    <div className="page">
      <h1>Events</h1>

      <label htmlFor="event-search">Search</label>
      <input
        id="event-search"
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <label htmlFor="event-category">Category</label>
      <select
        id="event-category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {loading && <div className="status-box">Loading events...</div>}
      {error && <div className="status-box error-msg">{error}</div>}
      {!loading && !error && <EventList events={filteredEvents} />}
    </div>
  );
}

export default Events;
