// src/components/ui/Navigation.jsx
import { NavLink } from "react-router-dom"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react"

export default function Navigation() {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-300 to-sky-300 bg-clip-text text-transparent transition-transform hover:scale-105"
          >
            Mortgage Destroyers
          </NavLink>
          <span className="hidden text-xs text-slate-500 sm:inline">
            Plan smart · Move fast · Pay less interest
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm font-semibold">
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1 transition-all ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "text-slate-300 hover:text-emerald-200"
              }`
            }
          >
            Distance Map
          </NavLink>
          <NavLink
            to="/mortgage"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1 transition-all ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "text-slate-300 hover:text-emerald-200"
              }`
            }
          >
            Mortgage Calculator
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1 transition-all ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "text-slate-300 hover:text-emerald-200"
              }`
            }
          >
            Saved History
          </NavLink>

          <div className="ml-2 flex items-center gap-2">
            <SignedOut>
              <SignInButton className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-emerald-700" />
              <SignUpButton className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-sky-700" />
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
      </div>
    </nav>
  )
}
