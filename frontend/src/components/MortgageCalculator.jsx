import { useEffect, useMemo, useState } from "react";
import AmortizationTable from "./AmortizationTable";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function parseNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("750000");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [interestRate, setInterestRate] = useState("6.5");
  const [termYears, setTermYears] = useState("30");
  const [propertyTaxRate, setPropertyTaxRate] = useState("1.2");
  const [insuranceMonthly, setInsuranceMonthly] = useState("120");
  const [hoaMonthly, setHoaMonthly] = useState("0");
  const [history, setHistory] = useState([]);
  const [csrfToken, setCsrfToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailMessageType, setEmailMessageType] = useState("");
  const [showAmortization, setShowAmortization] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/mortgage-history`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("History load error", err);
      }
    };

    const fetchCsrf = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/csrf-token`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setCsrfToken(data.csrfToken);
        }
      } catch (err) {
        console.error("CSRF fetch error", err);
      }
    };

    fetchHistory();
    fetchCsrf();
  }, []);

  const results = useMemo(() => {
    const price = parseNumber(homePrice);
    const dpPct = parseNumber(downPaymentPercent);
    const rate = parseNumber(interestRate);
    const years = parseNumber(termYears);
    const taxRate = parseNumber(propertyTaxRate);
    const ins = parseNumber(insuranceMonthly);
    const hoa = parseNumber(hoaMonthly);

    if (!price || !years) {
      return {
        loanAmount: 0,
        monthlyPI: 0,
        monthlyTax: 0,
        totalMonthly: 0,
        downPaymentAmount: 0,
      };
    }

    const downPaymentAmount = (price * dpPct) / 100;
    const loanAmount = Math.max(price - downPaymentAmount, 0);

    const n = years * 12;
    const monthlyRate = rate > 0 ? rate / 100 / 12 : 0;

    let monthlyPI = 0;
    if (monthlyRate === 0) {
      monthlyPI = loanAmount / n;
    } else {
      const factor = Math.pow(1 + monthlyRate, n);
      monthlyPI = (loanAmount * monthlyRate * factor) / (factor - 1);
    }

    const monthlyTax = (price * (taxRate / 100)) / 12;
    const totalMonthly = monthlyPI + monthlyTax + ins + hoa;

    return {
      loanAmount,
      monthlyPI,
      monthlyTax,
      totalMonthly,
      downPaymentAmount,
    };
  }, [
    homePrice,
    downPaymentPercent,
    interestRate,
    termYears,
    propertyTaxRate,
    insuranceMonthly,
    hoaMonthly,
  ]);

  const {
    loanAmount,
    monthlyPI,
    monthlyTax,
    totalMonthly,
    downPaymentAmount,
  } = results;

  async function handleSave() {
    if (!csrfToken) {
      setMessage("Security token missing. Please refresh.");
      setMessageType("error");
      return;
    }
    setSaving(true);
    setMessage("");
    setMessageType("");

    const inputs = {
      homePrice,
      downPaymentPercent,
      interestRate,
      termYears,
      propertyTaxRate,
      insuranceMonthly,
      hoaMonthly,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/mortgage-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          _csrf: csrfToken,
          inputs,
          results,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save calculation");
      }

      const saved = await res.json();
      setHistory((prev) => [saved, ...prev].slice(0, 50));
      setMessage("Saved to history.");
      setMessageType("success");
      // refresh token after successful post
      const csrfRes = await fetch(`${API_BASE_URL}/csrf-token`, {
        credentials: "include",
      });
      if (csrfRes.ok) {
        const data = await csrfRes.json();
        setCsrfToken(data.csrfToken);
      }
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteHistory(id) {
    if (!csrfToken) {
      setMessage("Security token missing. Please refresh.");
      setMessageType("error");
      return;
    }
    setDeletingId(id);
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/mortgage-history/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ _csrf: csrfToken }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete history item");
      }

      setHistory((prev) => prev.filter((item) => item.id !== id));
      setMessage("Removed from history.");
      setMessageType("success");
      const csrfRes = await fetch(`${API_BASE_URL}/csrf-token`, {
        credentials: "include",
      });
      if (csrfRes.ok) {
        const data = await csrfRes.json();
        setCsrfToken(data.csrfToken);
      }
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setDeletingId(null);
    }
  }

  function loadFromHistory(item) {
    const inputs = item.inputs || {};
    setHomePrice(inputs.homePrice || "0");
    setDownPaymentPercent(inputs.downPaymentPercent || "0");
    setInterestRate(inputs.interestRate || "0");
    setTermYears(inputs.termYears || "30");
    setPropertyTaxRate(inputs.propertyTaxRate || "0");
    setInsuranceMonthly(inputs.insuranceMonthly || "0");
    setHoaMonthly(inputs.hoaMonthly || "0");
  }

  async function handleEmail() {
    if (!csrfToken) {
      setEmailMessage("Security token missing. Please refresh.");
      setEmailMessageType("error");
      return;
    }
    if (!email.trim()) {
      setEmailMessage("Enter an email address first.");
      setEmailMessageType("error");
      return;
    }
    setEmailSending(true);
    setEmailMessage("");
    setEmailMessageType("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/mortgage-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          _csrf: csrfToken,
          email,
          inputs: {
            homePrice,
            downPaymentPercent,
            interestRate,
            termYears,
            propertyTaxRate,
            insuranceMonthly,
            hoaMonthly,
          },
          results,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send email");
      }
      setEmailMessage("Emailed your calculation.");
      setEmailMessageType("success");
      const csrfRes = await fetch(`${API_BASE_URL}/csrf-token`, {
        credentials: "include",
      });
      if (csrfRes.ok) {
        const data = await csrfRes.json();
        setCsrfToken(data.csrfToken);
      }
    } catch (err) {
      setEmailMessage(err.message);
      setEmailMessageType("error");
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
      </div>

      <main className="relative mx-auto flex max-w-5xl flex-col px-4 pb-10 pt-8">
        {/* Header */}
        <div className="mb-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-slate-950/70 px-3 py-1 text-xs font-medium text-emerald-200 shadow-sm shadow-emerald-500/20">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Mortgage Destroyers • Payment Planner
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Mortgage{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
              Payment Calculator
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Estimate your monthly payment, see how much goes to principal &
            interest, and spot the true cost of that “affordable” house before
            it handcuffs your budget.
          </p>
        </div>

        {/* Layout */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Form */}
          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/50 backdrop-blur">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Inputs
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Home Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Home price
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-emerald-500">
                  <span className="mr-1 text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={homePrice}
                    onChange={(e) => setHomePrice(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* Down Payment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Down payment (%)
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-emerald-500">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                  <span className="ml-1 text-slate-400">%</span>
                </div>
              </div>

              {/* Interest Rate */}
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

              {/* Term */}
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

              {/* Property Tax */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Property tax rate (annual)
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-emerald-500">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={propertyTaxRate}
                    onChange={(e) => setPropertyTaxRate(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                  <span className="ml-1 text-slate-400">%</span>
                </div>
              </div>

              {/* Insurance */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Insurance (monthly)
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-emerald-500">
                  <span className="mr-1 text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={insuranceMonthly}
                    onChange={(e) => setInsuranceMonthly(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* HOA */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">
                  HOA (monthly, if any)
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-emerald-500">
                  <span className="mr-1 text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={hoaMonthly}
                    onChange={(e) => setHoaMonthly(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 text-[0.7rem] text-slate-500">
              This is an estimate only. It doesn&apos;t include everything
              (like PMI or maintenance), but it helps you sanity-check whether a
              payment fits your real life, not just the bank&apos;s approval.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
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
              <button
                type="button"
                onClick={() => setShowAmortization((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-400/50 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500/10 active:scale-[0.98]"
              >
                {showAmortization
                  ? "Hide Amortization"
                  : "Show Amortization"}
              </button>
            </div>

            {message && (
              <div
                className={`mt-3 rounded-md p-3 text-sm ${
                  messageType === "success"
                    ? "bg-emerald-500/10 text-emerald-900"
                    : "bg-red-500/10 text-red-900"
                }`}
              >
                {message}
              </div>
            )}
            {emailMessage && (
              <div
                className={`mt-3 rounded-md p-3 text-sm ${
                  emailMessageType === "success"
                    ? "bg-emerald-500/10 text-emerald-900"
                    : "bg-red-500/10 text-red-900"
                }`}
              >
                {emailMessage}
              </div>
            )}
          </section>

          {/* Results */}
          <section className="space-y-5">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/50 backdrop-blur">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Monthly Breakdown
              </h2>

              <div className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-sky-500/20 p-4">
                <div className="text-xs text-slate-200">Estimated payment</div>
                <div className="mt-1 text-3xl font-semibold text-emerald-100">
                  {totalMonthly > 0
                    ? `$${totalMonthly.toFixed(0).toLocaleString()}`
                    : "—"}
                </div>
                <div className="mt-1 text-[0.7rem] text-slate-200">
                  Principal &amp; interest, taxes, insurance, and HOA.
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Loan amount</span>
                  <span className="font-mono text-slate-100">
                    {loanAmount > 0
                      ? `$${loanAmount.toFixed(0).toLocaleString()}`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Down payment</span>
                  <span className="font-mono text-slate-200">
                    {downPaymentAmount > 0
                      ? `$${downPaymentAmount.toFixed(0).toLocaleString()}`
                      : "—"}{" "}
                    ({downPaymentPercent || 0}%)
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Principal &amp; interest</span>
                  <span className="font-mono text-slate-100">
                    {monthlyPI > 0
                      ? `$${monthlyPI.toFixed(0).toLocaleString()}`
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Property taxes</span>
                  <span className="font-mono text-slate-200">
                    {monthlyTax > 0
                      ? `$${monthlyTax.toFixed(0).toLocaleString()}`
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Insurance</span>
                  <span className="font-mono text-slate-200">
                    {insuranceMonthly
                      ? `$${parseNumber(insuranceMonthly)
                          .toFixed(0)
                          .toLocaleString()}`
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>HOA</span>
                  <span className="font-mono text-slate-200">
                    {hoaMonthly
                      ? `$${parseNumber(hoaMonthly)
                          .toFixed(0)
                          .toLocaleString()}`
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-[0.75rem] text-slate-300">
                <div className="mb-1 font-semibold text-emerald-300">
                  Mortgage Destroyers tip
                </div>
                <p>
                  Use this number to work backwards: after giving to the Lord,
                  savings, and living expenses, can you still breathe with this
                  payment? If not, lower the price, raise the down payment, or
                  attack the term.
                </p>
              </div>
            </div>

          </section>
        </div>
        {showAmortization && (
          <AmortizationTable
            loanAmount={loanAmount}
            interestRate={interestRate}
            termYears={termYears}
            monthlyPI={monthlyPI}
          />
        )}

        {/* History list */}
        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/40">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Recent saves
            </h2>
            <span className="text-[0.7rem] text-slate-500">
              {history.length} saved
            </span>
          </div>
          {history.length === 0 && (
            <p className="text-sm text-slate-400">
              Save a calculation to see it here.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-left transition hover:border-emerald-400/60 hover:bg-slate-900/80"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <button
                    onClick={() => loadFromHistory(item)}
                    className="text-left text-slate-300 hover:text-emerald-200"
                  >
                    {new Date(item.createdAt).toLocaleString()}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-200">
                      $
                      {Number(item?.results?.totalMonthly || 0).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      aria-label="Remove"
                      onClick={() => handleDeleteHistory(item.id)}
                      disabled={deletingId === item.id}
                      className="rounded-md px-2 text-slate-500 hover:text-red-400 disabled:opacity-60"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => loadFromHistory(item)}
                  className="mt-2 text-left text-sm text-slate-200"
                >
                  ${Number(item?.inputs?.homePrice || 0).toLocaleString()} |
                  {item?.inputs?.downPaymentPercent || 0}% down |
                  {item?.inputs?.interestRate || 0}% |
                  {item?.inputs?.termYears || 0}y
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
