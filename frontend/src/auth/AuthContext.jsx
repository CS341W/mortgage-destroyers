import { createContext, useCallback, useContext, useEffect, useState } from "react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

const AuthContext = createContext(null)

async function fetchCsrfToken() {
  const res = await fetch(`${API_BASE_URL}/csrf-token`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to get CSRF token")
  const data = await res.json()
  return data.csrfToken
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [csrfToken, setCsrfToken] = useState("")
  const [loading, setLoading] = useState(true)

  const ensureCsrf = useCallback(async () => {
    if (csrfToken) return csrfToken
    const token = await fetchCsrfToken()
    setCsrfToken(token)
    return token
  }, [csrfToken])

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      })
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = await res.json()
      setUser(data)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        await ensureCsrf()
        await fetchMe()
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [ensureCsrf, fetchMe])

  const authPost = useCallback(
    async (path, body) => {
      const token = await ensureCsrf()
      const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ _csrf: token, ...body }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Request failed")
      }
      return res.json().catch(() => ({}))
    },
    [ensureCsrf]
  )

  const register = useCallback(
    async (email, password) => {
      const data = await authPost("/api/auth/register", { email, password })
      setUser(data)
      return data
    },
    [authPost]
  )

  const login = useCallback(
    async (email, password) => {
      const data = await authPost("/api/auth/login", { email, password })
      setUser(data)
      return data
    },
    [authPost]
  )

  const logout = useCallback(async () => {
    try {
      await authPost("/api/auth/logout", {})
    } catch (err) {
      console.error("Logout error", err)
    }
    setUser(null)
  }, [authPost])

  const requestReset = useCallback(
    async (email) => {
      await authPost("/api/auth/reset", { email })
      return true
    },
    [authPost]
  )

  const confirmReset = useCallback(
    async (token, password) => {
      const data = await authPost("/api/auth/reset/confirm", { token, password })
      setUser(data)
      return data
    },
    [authPost]
  )

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    requestReset,
    confirmReset,
    refresh: fetchMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
