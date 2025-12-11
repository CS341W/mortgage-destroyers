import { Link } from "react-router-dom"

const sections = [
  {
    title: "Map tools",
    items: [
      {
        title: "Area / Distance",
        desc: "Search an address, drop points, measure routes, and calculate areas fast.",
        href: "/map",
        cta: "Open map",
      },
      {
        title: "Structure Size",
        desc: "Visualize building outlines for quick context.",
        href: "/property-lines",
        cta: "Open structure map",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        title: "Mortgage Planner",
        desc: "Dial in price, down payment, rate, and taxes; save/email scenarios.",
        href: "/mortgage",
        cta: "Open calculator",
      },
      {
        title: "Amortization",
        desc: "See month-by-month payoff, interest vs principal.",
        href: "/amortization",
        cta: "View amortization",
      },
    ],
  },
  {
    title: "History",
    items: [
      {
        title: "Saved History",
        desc: "Reopen your saved runs, compare outcomes, and keep iterations tidy.",
        href: "/profile",
        cta: "View history",
      },
      {
        title: "Admin",
        desc: "Manage roles for users (admin only).",
        href: "/admin",
        cta: "Go to admin",
      },
    ],
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 opacity-30 mix-blend-screen">
        <div className="absolute -top-24 left-1/3 h-56 w-56 rounded-full bg-emerald-400 blur-3xl" />
        <div className="absolute bottom-6 right-10 h-64 w-64 rounded-full bg-sky-400 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-700 shadow dark:bg-slate-900/70 dark:text-emerald-200">
            Mortgage Destroyers
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Plan, measure, and compare without spreadsheets.
              </h1>
              <p className="mt-4 text-base text-slate-700 dark:text-slate-300">
                Mortgage Destroyers brings maps, calculators, and saved runs together so you
                can answer "what if?" quickly—on desktop or phone, light or dark mode.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/mortgage"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 active:scale-[0.98]"
                >
                  Start with calculator
                </Link>
                <Link
                  to="/map"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-lg shadow-slate-300/40 transition hover:border-emerald-400 hover:text-emerald-700 active:scale-[0.98] dark:border-slate-700 dark:text-slate-100 dark:hover:border-emerald-300"
                >
                  Explore maps
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-2xl shadow-emerald-500/10 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Quick snapshot</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-600 dark:text-emerald-200">
                  Live inputs
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-100 p-3 text-sm shadow-inner dark:bg-slate-800">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Monthly P&I
                  </div>
                  <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-200">
                    $2,184
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    6.25% • 30 yrs
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-sm shadow-inner dark:bg-slate-800">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Route distance
                  </div>
                  <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-200">
                    18.4 mi
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    4 points • 2 areas
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Tailored for quick comparisons: map measurements, payment plans, amortization,
                and saved history all in one place.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/50"
            >
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-slate-200/60 bg-white/70 p-3 transition hover:border-emerald-300 dark:border-slate-800/70 dark:bg-slate-900/70"
                  >
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      {item.desc}
                    </p>
                    <Link
                      to={item.href}
                      className="mt-3 inline-flex rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow hover:bg-emerald-400 dark:shadow-emerald-500/30"
                    >
                      {item.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Built for speed
            </h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              Responsive layout, light/dark themes, and mobile-friendly nav keep the tools within
              reach on any device.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>• Dark / Light toggle persists</li>
              <li>• Mobile-first nav with quick links</li>
              <li>• Save/email flows gated to signed-in users</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Admin-ready
            </h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              Role-aware controls ensure visitors can explore, while users/admins get save/delete
              and email abilities, plus an admin console.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
              Admin dashboard → manage roles
            </div>
          </div>
        </section>

        <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Mortgage Destroyers.</span>
          <span>Maps, payments, and history—simplified.</span>
        </footer>
      </main>
    </div>
  )
}
