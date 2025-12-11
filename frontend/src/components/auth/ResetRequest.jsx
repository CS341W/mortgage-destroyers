import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"

export default function ResetRequest() {
  const { requestReset } = useAuth()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")
    try {
      await requestReset(email)
      setMessage("If that account exists, a reset token was emailed.")
    } catch (err) {
      setError(err.message || "Could not send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Reset password</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              required
            />
          </div>
          {message && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset email"}
          </button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-300">
          <Link className="text-emerald-300 hover:text-emerald-200" to="/login">
            Back to sign in
          </Link>
          <Link className="text-emerald-300 hover:text-emerald-200" to="/reset/confirm">
            Have a token? Reset now
          </Link>
        </div>
      </div>
    </div>
  )
}
