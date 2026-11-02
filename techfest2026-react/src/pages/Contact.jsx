import { useState, useEffect } from "react";
import { apiFetch, errorText } from "../api";

function Contact() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    apiFetch("/api/feedback")
      .then(({ ok, data }) => ok && setFeedback(data))
      .catch(() => setStatus("Could not load feedback."));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const { ok, data } = await apiFetch("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ name, message })
    });

    if (ok) {
      setFeedback((list) => [data, ...list]);
      setMessage("");
      setStatus("Thank you for your feedback!");
    } else {
      setStatus(errorText(data));
    }
  }

  return (
    <div className="page">
      <h1>Contact Us</h1>

      <p>Email: techfest2026@mbcet.ac.in</p>
      <p>Phone: +91 8075348521</p>
      <p>Venue: MBCET Campus, Thiruvananthapuram</p>

      <h2>Feedback</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="fb-name">Name (optional)</label>
        <input
          id="fb-name"
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="fb-message">Message</label>
        <textarea
          id="fb-message"
          rows={4}
          maxLength={500}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <br />
        <button type="submit">Send</button>
      </form>

      {status && <p>{status}</p>}

      <div className="feedback-list">
        {feedback.map((f) => (
          <article className="event-card" key={f._id}>
            <strong>{f.name}</strong>

            {/* XSS fix: {f.message} is shown as plain text - React escapes
                it, so "<script>" appears as text and never runs.
                The unsafe version was:
                <p dangerouslySetInnerHTML={{ __html: f.message }} /> */}
            <p>{f.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Contact;
