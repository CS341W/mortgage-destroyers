// src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Glow background */}
      <div className="pointer-events-none fixed inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        {/* Header / Brand */}
        <header className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/40">
              <span className="text-lg font-black tracking-tight text-emerald-300">
                MD
              </span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Mortgage Destroyers
              </h1>
              <p className="text-xs text-slate-400">
                Plan smart. Buy smart. Crush your mortgage.
              </p>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mb-10 grid flex-1 gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-slate-900/70 px-3 py-1 text-xs font-medium text-emerald-200 shadow-sm shadow-emerald-500/20">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Distance Planner • Mortgage Strategy Tool
            </p>

            <h2 className="mb-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Measure your world. <br />
              <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
                Destroy your mortgage.
              </span>
            </h2>

            <p className="mb-6 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Use our interactive distance calculator to compare commutes, map
              out neighborhoods, and plan smarter home decisions—before you
              lock in a 30-year mistake.
            </p>

            {/* Main CTA */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Link
                to="/map"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 active:scale-[0.98]"
              >
                Open Distance Calculator
                <span className="ml-2 text-lg">↗</span>
              </Link>

              <span className="text-xs text-slate-400">
                No login needed. Just click, draw, and explore.
              </span>
            </div>

            {/* Mini steps */}
            <div className="grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-3">
                <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-emerald-300">
                  Step 1
                </div>
                <div className="font-medium">Search an address</div>
                <p className="mt-1 text-[0.7rem] text-slate-400">
                  Jump straight to a property, church, or workplace.
                </p>
              </div>
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-3">
                <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-emerald-300">
                  Step 2
                </div>
                <div className="font-medium">Draw your route</div>
                <p className="mt-1 text-[0.7rem] text-slate-400">
                  Click to trace commutes, school runs, or key distances.
                </p>
              </div>
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-3">
                <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-emerald-300">
                  Step 3
                </div>
                <div className="font-medium">Plan like a pro</div>
                <p className="mt-1 text-[0.7rem] text-slate-400">
                  Use the distance to stress-test your mortgage & lifestyle.
                </p>
              </div>
            </div>
          </div>

          {/* Feature card – single option: Distance Calculator */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-emerald-400/60 via-sky-400/40 to-emerald-500/50 opacity-80 blur-xl" />
            <div className="relative h-full rounded-3xl border border-slate-700/80 bg-slate-950/90 p-5 shadow-2xl shadow-emerald-500/40">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    Distance Calculator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Satellite map • Address search • Live distance readout
                  </p>
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500/15 text-lg">
                  📏
                </span>
              </div>

              {/* Fake mini preview */}
              <div className="mb-4 rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-3">
                <div className="mb-2 flex items-center justify-between text-[0.7rem] text-slate-400">
                  <span>World Imagery</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] text-emerald-200">
                    Live
                  </span>
                </div>
                <div className="h-32 rounded-xl bg-[radial-gradient(circle_at_top,_#22c55e33,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e933,_transparent_55%)]">
                  <div className="flex h-full items-center justify-center text-[0.7rem] text-slate-300">
                    Interactive map preview
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-[0.75rem] text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Mode</span>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[0.7rem] text-emerald-200">
                    Satellite • Multi-point
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Use case</span>
                  <span className="text-right">
                    Compare commutes, neighborhoods, & property access.
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <Link
                  to="/map"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 active:scale-[0.98]"
                >
                  Launch Distance Calculator
                  <span className="ml-2 text-base">➡️</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-4 text-[0.7rem] text-slate-500">
          <span>© {new Date().getFullYear()} Mortgage Destroyers.</span>
          <span>Built for people who refuse to worship a mortgage.</span>
        </footer>
      </main>
    </div>
  );
}
