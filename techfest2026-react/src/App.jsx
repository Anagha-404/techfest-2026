import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import { useTheme } from "./context/ThemeContext";

// Lazy loading: each page is a separate file that is downloaded only when
// the user opens it, so the first load (Home) is smaller and faster.
const Events = lazy(() => import("./pages/Events"));
const Registration = lazy(() => import("./pages/Registration"));
const Login = lazy(() => import("./pages/Login"));
const MyRegistrations = lazy(() => import("./pages/MyRegistrations"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <Navbar />

      <main>
        <Suspense fallback={<div className="page status-box">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-registrations" element={<MyRegistrations />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
