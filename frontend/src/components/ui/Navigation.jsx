// src/components/ui/Navigation.jsx
import { NavLink } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

export default function Navigation() {
  return (
    <nav className="bg-slate-950/90 border-b border-slate-800 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <NavLink
          to="/"
          className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-500 to-sky-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
        >
          Mortgage Destroyers
        </NavLink>

        {/* Right side: nav links + auth */}
        <div className="flex items-center gap-6">
          {/* Only main feature link */}
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `text-sm font-semibold transition-all ${
                isActive
                  ? "text-emerald-400 border-b-2 border-emerald-400 pb-1"
                  : "text-slate-400 hover:text-emerald-300"
              }`
            }
          >
            📍 Distance Calculator
          </NavLink>

          {/* Auth area */}
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-all text-xs font-semibold shadow-md" />
              <SignUpButton className="bg-sky-600 text-white px-3 py-1.5 rounded-lg hover:bg-sky-700 transition-all text-xs font-semibold shadow-md" />
            </div>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
