import { useMemo } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"

export default function Navigation() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  const menuItems = useMemo(() => {
    const base = [
      { to: "/map", short: "A/D", full: "Area / Distance" },
      { to: "/property-lines", short: "Struct", full: "Structure Size" },
      { to: "/mortgage", short: "Mort", full: "Mortgage Calc" },
      { to: "/amortization", short: "Amor", full: "Amortization" },
      { to: "/profile", short: "Hist", full: "Saved History" },
    ]
    if (user?.role === "admin") {
      base.push({ to: "/admin", short: "Admin", full: "Admin" })
    }
    return base
  }, [user])

  const linkClass = ({ isActive }) =>
    `group relative flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-800 px-2 transition-[width,background-color,border-color] duration-200 ease-out sm:w-16 sm:hover:w-40 ${
      isActive
        ? "bg-emerald-500/15 border-emerald-400/60 text-emerald-200"
        : "bg-slate-900/60 text-slate-300 hover:text-emerald-200 hover:border-emerald-400/50"
    }`

  return (
    <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <NavLink
          to="/"
          className="shrink-0 text-lg font-black tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-300 to-sky-300 bg-clip-text text-transparent transition-transform hover:scale-105"
        >
          Mortgage Destroyers
        </NavLink>

        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {menuItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <span className="block whitespace-nowrap text-xs font-semibold transition-opacity duration-150 sm:opacity-100 sm:group-hover:opacity-0">
                {item.short}
              </span>
              <span className="pointer-events-none absolute inset-0 hidden items-center justify-center whitespace-nowrap px-3 text-sm font-semibold opacity-0 transition-opacity duration-150 sm:flex sm:group-hover:opacity-100">
                {item.full}
              </span>
            </NavLink>
          ))}

          {user ? (
            <>
              <span className="hidden shrink-0 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400 sm:block">
                {user.email} ({user.role})
              </span>
              <button
                onClick={async () => {
                  await logout()
                  nav("/login")
                }}
                className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-700"
              >
                Sign in
              </NavLink>
              <NavLink
                to="/register"
                className="shrink-0 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-sky-700"
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
