import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="page">
      <h1>404 - Page Not Found</h1>

      <Link to="/">Go back Home</Link>
    </div>
  );
}

export default NotFound;