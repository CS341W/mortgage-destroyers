import { useEffect, useMemo, useState } from "react"
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react"
import AmortizationTable from "./AmortizationTable"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

function parseNumber(val, fallback = 0) {
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

export default function AmortizationPage() {
  const { user } = useUser()
  const [loanAmount, setLoanAmount] = useState("300000")
  const [interestRate, setInterestRate] = useState("6.5")
  const [termYears, setTermYears] = useState("30")
  const [monthlyPI, setMonthlyPI] = useState("")

  const [csrfToken, setCsrfToken] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  const [email, setEmail] = useState("")
  const [emailSending, setEmailSending] = useState(false)
  const [emailMessage, setEmailMessage] = useState("")
  const [emailMessageType, setEmailMessageType] = useState("")

  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/csrf-token`, {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setCsrfToken(data.csrfToken)
        }
      } catch (err) {
        console.error("CSRF fetch error", err)
      }
    }
    fetchCsrf()
  }, [])

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress)
    }
  }, [user])

  const computedMonthlyPI = useMemo(() => {
    const principal = parseNumber(loanAmount)
    const rate = parseNumber(interestRate)
    const years = parseNumber(termYears)
    if (!principal || !rate || !years) return 0
    const monthlyRate = rate / 100 / 12
    const n = years * 12
    const factor = Math.pow(1 + monthlyRate, n)
    return (principal * monthlyRate * factor) / (factor - 1)
  }, [loanAmount, interestRate, termYears])

  const effectiveMonthlyPI =
    parseNumber(monthlyPI) > 0 ? parseNumber(monthlyPI) : computedMonthlyPI

  const amortInputs = {
    loanAmount,
    interestRate,
    termYears,
    monthlyPI: effectiveMonthlyPI,
  }

  async function handleSave() {
    if (!csrfToken) {
      setMessage("Security token missing. Please refresh.")
      setMessageType("error")
      return
    }
    setSaving(true)
    setMessage("")
    setMessageType("")
    try {
      const res = await fetch(`${API_BASE_URL}/api/mortgage-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          _csrf: csrfToken,
          inputs: amortInputs,
          results: { totalMonthly: effectiveMonthlyPI },
          label: "Amortization",
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save amortization")
      }
      setMessage("Saved to history.")
      setMessageType("success")
      const csrfRes = await fetch(`${API_BASE_URL}/csrf-token`, {
        credentials: "include",
      })
      if (csrfRes.ok) {
        const data = await csrfRes.json()
        setCsrfToken(data.csrfToken)
      }
    } catch (err) {
      setMessage(err.message)
      setMessageType("error")
    } finally {
      setSaving(false)
    }
  }

  async function handleEmail() {
    if (!csrfToken) {
      setEmailMessage("Security token missing. Please refresh.")
      setEmailMessageType("error")
      return
    }
    if (!email.trim()) {
      setEmailMessage("Enter an email address first.")
      setEmailMessageType("error")
      return
    }
    setEmailSending(true)
    setEmailMessage("")
    setEmailMessageType("")
    try {
      const res = await fetch(`${API_BASE_URL}/api/amortization-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          _csrf: csrfToken,
          email,
          loanAmount: parseNumber(loanAmount),
          interestRate: parseNumber(interestRate),
          termYears: parseNumber(termYears),
          monthlyPI: effectiveMonthlyPI,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to send email")
      }
      setEmailMessage("Emailed your amortization summary.")
      setEmailMessageType("success")
      const csrfRes = await fetch(`${API_BASE_URL}/csrf-token`, {
        credentials: "include",
      })
      if (csrfRes.ok) {
        const data = await csrfRes.json()
        setCsrfToken(data.csrfToken)
      }
    } catch (err) {
      setEmailMessage(err.message)
      setEmailMessageType("error")
    } finally {
      setEmailSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 opacity-30 mix-blend-screen">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
      </div>

      <main className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-slate-950/70 px-3 py-1 text-xs font-medium text-emerald-200 shadow-sm shadow-emerald-500/20">
              Payoff Planner
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Amortization Schedule
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Enter loan details to see month-by-month principal and interest.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/50 backdrop-blur">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Inputs
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Loan amount
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-emerald-500">
                  <span className="mr-1 text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Interest rate (APR)
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-emerald-500">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                  <span className="ml-1 text-slate-400">%</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Term (years)
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-emerald-500">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={termYears}
                    onChange={(e) => setTermYears(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                  <span className="ml-1 text-slate-400">yrs</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Monthly principal &amp; interest (optional)
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-emerald-500">
                  <span className="mr-1 text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={monthlyPI}
                    onChange={(e) => setMonthlyPI(e.target.value)}
                    className="w-full bg-transparent outline-none"
                    placeholder="Auto-calculated if blank"
                  />
                </div>
              </div>
            </div>

            <p className="mt-3 text-[0.7rem] text-slate-500">
              Leave monthly P&amp;I blank to auto-calc based on rate and term.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <SignedIn>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !csrfToken}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save to history"}
                </button>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-44 bg-transparent outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleEmail}
                    disabled={emailSending || !csrfToken}
                    className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {emailSending ? "Sending..." : "Email this"}
                  </button>
                </div>
              </SignedIn>
              <SignedOut>
                <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                  Sign in to save or email your amortization.
                </div>
              </SignedOut>
            </div>

            {message && (
              <div
                className={`mt-3 rounded-md p-3 text-sm ${
                  messageType === "success"
                    ? "bg-emerald-500/10 text-emerald-200"
                    : "bg-red-500/10 text-red-200"
                }`}
              >
                {message}
              </div>
            )}
            {emailMessage && (
              <div
                className={`mt-3 rounded-md p-3 text-sm ${
                  emailMessageType === "success"
                    ? "bg-emerald-500/10 text-emerald-200"
                    : "bg-red-500/10 text-red-200"
                }`}
              >
                {emailMessage}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-emerald-500/40 bg-slate-950/90 p-5 shadow-[0_0_40px_rgba(16,185,129,0.35)] backdrop-blur">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Summary
            </h2>
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-sky-500/20 p-4">
              <div className="text-xs text-slate-200">Monthly P&amp;I</div>
              <div className="mt-1 text-3xl font-semibold text-emerald-100">
                {effectiveMonthlyPI > 0
                  ? `$${effectiveMonthlyPI.toFixed(0).toLocaleString()}`
                  : "-"}
              </div>
              <div className="mt-1 text-[0.7rem] text-slate-200">
                Principal &amp; interest only.
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Loan amount</span>
                <span className="font-mono text-slate-100">
                  {parseNumber(loanAmount) > 0
                    ? `$${parseNumber(loanAmount)
                        .toFixed(0)
                        .toLocaleString()}`
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Rate / Term</span>
                <span className="font-mono text-slate-200">
                  {interestRate || 0}% / {termYears || 0} yrs
                </span>
              </div>
            </div>
          </div>
        </section>

        <AmortizationTable
          loanAmount={parseNumber(loanAmount)}
          interestRate={parseNumber(interestRate)}
          termYears={parseNumber(termYears)}
          monthlyPI={effectiveMonthlyPI}
        />
      </main>
    </div>
  )
}
