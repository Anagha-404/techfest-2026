import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <h2>TechFest 2026</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/contact">Contact</Link>

        {user ? (
          <>
            <Link to="/my-registrations">My Registrations</Link>
            <button type="button" onClick={handleLogout}>
              Logout ({user.name})
            </button>
          </>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>

      <button type="button" onClick={toggleTheme}>
        {theme === "light"
          ? "Switch to Dark"
          : "Switch to Light"}
      </button>
    </nav>
  );
}

export default Navbar;
