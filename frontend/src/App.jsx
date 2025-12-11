// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/ui/Navigation";
import Home from "./components/Home";
import Profile from "./components/Profile";
import MapPage from "./Map/MapPage.jsx";
import PropertyLinesPage from "./Map/PropertyLinesPage.jsx";
import MortgageCalculator from "./components/MortgageCalculator.jsx";
import AmortizationPage from "./components/AmortizationPage.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import ResetRequest from "./components/auth/ResetRequest.jsx";
import ResetConfirm from "./components/auth/ResetConfirm.jsx";
import AdminPage from "./components/admin/AdminPage.jsx";
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
            <Route path="/property-lines" element={<PropertyLinesPage />} />
            <Route path="/mortgage" element={<MortgageCalculator />} />
            <Route path="/amortization" element={<AmortizationPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset" element={<ResetRequest />} />
            <Route path="/reset/confirm" element={<ResetConfirm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
