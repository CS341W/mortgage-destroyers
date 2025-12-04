import { useState, useEffect } from "react"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // 'success' or 'error'
  const [csrfToken, setCsrfToken] = useState("")

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/csrf-token`, {
          credentials: "include", // Important for CSRF cookies
        })
        if (response.ok) {
          const data = await response.json()
          setCsrfToken(data.csrfToken)
        }
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error)
      }
    }

    fetchCsrfToken()
  }, [API_BASE_URL])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      setMessage("Please enter your email address")
      setMessageType("error")
      return
    }

    if (!csrfToken) {
      setMessage("Security token not loaded. Please refresh and try again.")
      setMessageType("error")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/journal-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for CSRF cookies
        body: JSON.stringify({
          email,
          name,
          _csrf: csrfToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Welcome! Check your email for confirmation.")
        setMessageType("success")
        setEmail("")
        setName("")
        // Refresh CSRF token for next submission
        const csrfResponse = await fetch(`${API_BASE_URL}/csrf-token`, {
          credentials: "include",
        })
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json()
          setCsrfToken(csrfData.csrfToken)
        }
      } else {
        setMessage(data.error || "Something went wrong. Please try again.")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Newsletter signup error:", error)
      setMessage("Network error. Please check your connection and try again.")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          📧 Stay Updated
        </h3>
        <p className="text-gray-600 text-sm">
          Get the latest posts and insights delivered to your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name (optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !csrfToken}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? "Signing up..." : "Subscribe"}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-3">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  )
}
