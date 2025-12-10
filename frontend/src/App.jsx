// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/ui/Navigation";
import Home from "./components/Home";
import Profile from "./components/Profile";
import MapPage from "./Map/MapPage.jsx";
import MortgageCalculator from "./components/MortgageCalculator.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/mortgage" element={<MortgageCalculator />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
