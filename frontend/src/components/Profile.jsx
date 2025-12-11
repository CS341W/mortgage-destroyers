import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext.jsx"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

export default function Profile() {
  const { user } = useAuth()
  const isSignedIn = !!user
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [csrfToken, setCsrfToken] = useState("")
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`${API_BASE_URL}/api/mortgage-history`, {
          credentials: "include",
        })
        if (!res.ok) {
          throw new Error("Failed to load history")
        }
        const data = await res.json()
        setHistory(data)
      } catch (err) {
        setError(err.message || "Could not load history")
      } finally {
        setLoading(false)
      }
    }

    if (isSignedIn) {
      fetchHistory()
    } else {
      setHistory([])
    }

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

    if (isSignedIn) {
      fetchCsrf()
    } else {
      setCsrfToken("")
    }
  }, [isSignedIn])

  const handleDelete = async (id) => {
    if (!csrfToken) {
      setError("Security token missing. Please refresh.")
      return
    }
    setDeletingId(id)
    setError("")
    try {
      const res = await fetch(`${API_BASE_URL}/api/mortgage-history/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ _csrf: csrfToken }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete entry")
      }
      setHistory((prev) => prev.filter((item) => item.id !== id))
      // refresh token after mutation
      const csrfRes = await fetch(`${API_BASE_URL}/csrf-token`, {
        credentials: "include",
      })
      if (csrfRes.ok) {
        const data = await csrfRes.json()
        setCsrfToken(data.csrfToken)
      }
    } catch (err) {
      setError(err.message || "Could not delete entry")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 opacity-30 mix-blend-screen">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
      </div>

      <main className="relative mx-auto flex max-w-5xl flex-col px-4 pb-10 pt-8">
        <header className="mb-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-slate-950/70 px-3 py-1 text-xs font-medium text-emerald-200 shadow-sm shadow-emerald-500/20">
            Mortgage Destroyers - Saved Runs - Must be signed in to save/view
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Calculation History
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Recent mortgage calculations saved from the calculator. Use these
            to revisit past scenarios quickly.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200">
          Please sign in to view, save, or delete history.
        </div>

        {isSignedIn && loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200">
            Loading history…
          </div>
        )}

        {isSignedIn && error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {isSignedIn && !loading && !error && history.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200">
            No saved calculations yet. Run one in the calculator and tap
            "Save to history." (Sign in required to save/delete.)
          </div>
        )}

        {isSignedIn && (
          <div className="grid gap-4 sm:grid-cols-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-black/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-emerald-200">
                      {item.label || "Saved scenario"}
                    </div>
                    <div className="text-[0.7rem] text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {isSignedIn && (
                    <button
                      type="button"
                      aria-label="Remove entry"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="rounded-md px-2 text-slate-500 hover:text-red-400 disabled:opacity-60"
                    >
                      X
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Home price</span>
                    <span className="font-mono">
                      ${Number(item?.inputs?.homePrice || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Down payment</span>
                    <span className="font-mono">
                      {item?.inputs?.downPaymentPercent || 0}% (
                      $
                      {Number(
                        item?.results?.downPaymentAmount || 0
                      ).toLocaleString()}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate / Term</span>
                    <span className="font-mono">
                      {item?.inputs?.interestRate || 0}% •{" "}
                      {item?.inputs?.termYears || 0} yrs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly total</span>
                    <span className="font-mono text-emerald-200">
                      $
                      {Number(item?.results?.totalMonthly || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
