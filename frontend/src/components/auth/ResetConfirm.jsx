import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"

export default function ResetConfirm() {
  const { confirmReset } = useAuth()
  const [searchParams] = useSearchParams()
  const nav = useNavigate()
  const [token, setToken] = useState(searchParams.get("token") || "")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await confirmReset(token, password)
      nav("/")
    } catch (err) {
      setError(err.message || "Reset failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Enter reset token</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-300">Reset token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-300">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              required
            />
          </div>
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
            {loading ? "Updating..." : "Reset password"}
          </button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-300">
          <Link className="text-emerald-300 hover:text-emerald-200" to="/login">
            Back to sign in
          </Link>
          <Link className="text-emerald-300 hover:text-emerald-200" to="/reset">
            Need a token? Send reset email
          </Link>
        </div>
      </div>
    </div>
  )
}
