import { useEffect, useState } from "react"
import { useAuth } from "../../auth/AuthContext"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""
const ROLES = ["admin", "user", "visitor"]

export default function AdminPage() {
  const { user } = useAuth()
  const [csrfToken, setCsrfToken] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [savingId, setSavingId] = useState(null)

  const fetchCsrf = async () => {
    const res = await fetch(`${API_BASE_URL}/csrf-token`, {
      credentials: "include",
    })
    if (!res.ok) throw new Error("CSRF fetch failed")
    const data = await res.json()
    setCsrfToken(data.csrfToken)
    return data.csrfToken
  }

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load users")
      }
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      setError(err.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {
      fetchCsrf().catch(() => {})
      fetchUsers()
    }
  }, [user])

  const updateRole = async (id, role) => {
    setSavingId(id)
    setError("")
    try {
      const token = csrfToken || (await fetchCsrf())
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ _csrf: token, role }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update role")
      }
      const updated = await res.json()
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u))
      )
    } catch (err) {
      setError(err.message || "Failed to update role")
    } finally {
      setSavingId(null)
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <h1 className="text-2xl font-semibold mb-2">Admin</h1>
          <p className="text-sm text-slate-400">
            You must be signed in as an admin to view this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
          <p className="text-sm text-slate-300">
            Manage user roles. Seed admin: {user.email}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-2 font-mono text-xs sm:text-sm">
                      {u.email}
                    </td>
                    <td className="px-4 py-2">
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase tracking-wide">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {ROLES.map((r) => (
                          <button
                            key={r}
                            onClick={() => updateRole(u.id, r)}
                            disabled={savingId === u.id || u.role === r}
                            className={`rounded-lg border px-2 py-1 text-xs ${
                              u.role === r
                                ? "border-emerald-400/60 text-emerald-200"
                                : "border-slate-700 text-slate-200 hover:border-emerald-400 hover:text-emerald-200"
                            } disabled:opacity-60`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
