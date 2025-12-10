import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 opacity-30 mix-blend-screen">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="mb-10">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-slate-900/70 px-3 py-1 text-xs font-medium text-emerald-200 shadow-sm shadow-emerald-500/20">
            Measure | Compare | Decide faster
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            The fast lane to smarter home decisions.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Jump between your distance map, mortgage payment planner, and saved
            scenarios without digging through spreadsheets.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/map"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              Open Distance Map
            </Link>
            <Link
              to="/mortgage"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-400/50 px-5 py-2.5 text-sm font-semibold text-emerald-100 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500/10 active:scale-[0.98]"
            >
              Plan a Mortgage
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-emerald-400/80"
            >
              View Saved Runs
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-lg shadow-black/30">
            <div className="mb-2 text-sm font-semibold text-emerald-200">
              Distance Map
            </div>
            <p className="text-sm text-slate-300">
              Search any address, drop points, draw areas, and measure routes so
              you can compare commutes and neighborhood reach in seconds.
            </p>
            <Link
              to="/map"
              className="mt-4 inline-flex rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-emerald-400"
            >
              Go to map
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-lg shadow-black/30">
            <div className="mb-2 text-sm font-semibold text-emerald-200">
              Mortgage Calculator
            </div>
            <p className="text-sm text-slate-300">
              Dial in price, down payment, rate, and taxes to see a clear
              monthly number—then save the scenario to history.
            </p>
            <Link
              to="/mortgage"
              className="mt-4 inline-flex rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-emerald-400"
            >
              Open calculator
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-lg shadow-black/30">
            <div className="mb-2 text-sm font-semibold text-emerald-200">
              Saved History
            </div>
            <p className="text-sm text-slate-300">
              Pull up your latest calculations, compare monthly totals, and
              reuse inputs without retyping.
            </p>
            <Link
              to="/profile"
              className="mt-4 inline-flex rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-emerald-400"
            >
              View history
            </Link>
          </div>
        </section>

        <footer className="mt-10 flex items-center justify-between border-t border-slate-800/80 pt-4 text-[0.75rem] text-slate-500">
          <span>© {new Date().getFullYear()} Mortgage Destroyers.</span>
          <span>Built to keep you out of mortgage traps.</span>
        </footer>
      </main>
    </div>
  )
}
