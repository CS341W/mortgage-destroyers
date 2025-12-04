// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/ui/Navigation";
import Home from "./components/Home";
import Profile from "./components/Profile";
import MapPage from "./Map/MapPage.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      {/* Outer shell – let pages control their own fancy backgrounds */}
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <Navigation />
        <main>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<Home />} />

            {/* Distance Calculator */}
            <Route path="/map" element={<MapPage />} />

            {/* Optional: user profile (only visible when signed in via nav) */}
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
