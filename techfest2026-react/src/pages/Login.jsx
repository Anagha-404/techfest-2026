import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, errorText } from "../api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { ok, data } = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      if (ok) {
        // The token is now in an httpOnly cookie set by the server;
        // we only keep the user's name/role in React state.
        setUser(data.user);
        navigate("/events");
      } else {
        setMessage(errorText(data));
      }
    } catch {
      setMessage("Server Error");
    }
  };

  return (
    <div className="page">
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <br /><br />

        <button type="submit">
          Login
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Login;
