import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=3")
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to retrieve the latest announcements.");
        setLoading(false);
      });
  }, []);

  const announcements = {
    1: {
      title: "TechFest 2026 Registration Open",
      text: "Registration is now open for all TechFest 2026 events. Participants are encouraged to register early and secure their preferred events."
    },
    2: {
      title: "Official Event Schedule Released",
      text: "The official schedule for coding, robotics, web development, cultural and sports events is now available."
    },
    3: {
      title: "Participant Guidelines",
      text: "Participants are requested to review the event guidelines, reporting times and eligibility requirements before attending."
    }
  };

  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">MBCET • ANNUAL TECHNOLOGY FEST</p>

          <h1>TECHFEST 2026</h1>

          <h2>Innovate. Build. Inspire.</h2>

          <p className="hero-description">
            A three-day celebration of technology, innovation and creativity,
            bringing together students, developers, makers and innovators.
          </p>

          <div className="hero-buttons">
            <Link to="/events" className="primary-btn">
              Explore Events
            </Link>

            <Link to="/register" className="secondary-btn">
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="stats">
        <div className="stat-card">
          <h3>03</h3>
          <p>Days of Innovation</p>
        </div>

        <div className="stat-card">
          <h3>05</h3>
          <p>Featured Events</p>
        </div>

        <div className="stat-card">
          <h3>1000+</h3>
          <p>Expected Participants</p>
        </div>

        <div className="stat-card">
          <h3>2026</h3>
          <p>Edition</p>
        </div>
      </section>

      {/* Announcements */}
      <section className="announcements page">
        <p className="section-label">STAY UPDATED</p>

        <h2>Latest Announcements</h2>

        <p className="section-description">
          Stay informed about important TechFest updates, schedules and
          activities.
        </p>

        {loading && (
          <div className="status-box">
            Loading announcements...
          </div>
        )}

        {error && (
          <div className="status-box error-msg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="announcement-grid">
            {posts.map((post) => {
              const announcement = announcements[post.id];

              return (
                <article
                  className="announcement-card"
                  key={post.id}
                >
                  <span>UPDATE {post.id}</span>

                  <h3>{announcement.title}</h3>

                  <p>{announcement.text}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}

export default Home;