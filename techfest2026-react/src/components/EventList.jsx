import EventCard from "./EventCard";

// This component receives an ARRAY of events
function EventList({ events }) {
  if (events.length === 0) {
    return <p>No events found.</p>;
  }

  return (
    <div className="event-grid">
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
        />
      ))}
    </div>
  );
}

export default EventList;