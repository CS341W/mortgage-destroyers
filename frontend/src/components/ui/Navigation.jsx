import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react"

export default function Navigation() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 sm:py-1 transition-all ${
      isActive
        ? "bg-emerald-500/20 text-emerald-200"
        : "text-slate-300 hover:text-emerald-200"
    }`

  return (
    <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-300 to-sky-300 bg-clip-text text-transparent transition-transform hover:scale-105"
          >
            Mortgage Destroyers
          </NavLink>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-200 hover:border-emerald-400 hover:text-emerald-200 sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <div
          className={`${
            open ? "flex" : "hidden"
          } w-full flex-col items-start gap-2 text-sm font-semibold sm:flex sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3`}
        >
          <NavLink to="/map" onClick={() => setOpen(false)} className={linkClass}>
            Area / Distance
          </NavLink>
          <NavLink
            to="/property-lines"
            onClick={() => setOpen(false)}
            className={linkClass}
          >
            Structure Size
          </NavLink>
          <NavLink
            to="/mortgage"
            onClick={() => setOpen(false)}
            className={linkClass}
          >
            Mortgage Calculator
          </NavLink>
          <NavLink
            to="/amortization"
            onClick={() => setOpen(false)}
            className={linkClass}
          >
            Amortization
          </NavLink>
          <NavLink
            to="/profile"
            onClick={() => setOpen(false)}
            className={linkClass}
          >
            Saved History
          </NavLink>

          <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0 sm:ml-2">
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
