import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, errorText } from "../api";

function Registration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};

    if (name.trim().length < 2) {
      newErrors.name = "Name is required";
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone =
        "Enter a valid 10-digit Indian mobile number";
    }

    // at least 8 characters, with at least one letter and one number
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
      newErrors.password =
        "Password must be 8+ characters with a letter and a number";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) {
      return;
    }

    try {
      const { ok, data } = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      if (ok) {
        setMessage("Registration Successful. You can now login.");

        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setErrors({});
      } else {
        setMessage(errorText(data));
      }
    } catch {
      setMessage("Server Error");
    }
  }

  return (
    <div className="page">
      <h1>Registration</h1>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="reg-name">Name</label>
        <input
          id="reg-name"
          autoComplete="name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        {errors.name && (
          <p className="error-msg">
            {errors.name}
          </p>
        )}

        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        {errors.email && (
          <p className="error-msg">
            {errors.email}
          </p>
        )}

        <label htmlFor="reg-phone">Mobile Number</label>
        <input
          id="reg-phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
        />

        {errors.phone && (
          <p className="error-msg">
            {errors.phone}
          </p>
        )}

        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {errors.password && (
          <p className="error-msg">
            {errors.password}
          </p>
        )}

        <button type="submit">
          Register
        </button>
      </form>

      {message && <p>{message}</p>}

      <p>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Registration;
