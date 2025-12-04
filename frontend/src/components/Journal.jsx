import { useState, useEffect } from "react"
import Accordion from "./ui/Accordion"
import Modal from "./ui/Modal"
import { SignedIn, useUser } from "@clerk/clerk-react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

const Journal = () => {
  const { user } = useUser()
  const { role } = user?.publicMetadata || null

  const [entries, setEntries] = useState([])
  const [csrfToken, setCsrfToken] = useState("")
  const [loading, setLoading] = useState(true)
  const [expandedEntry, setExpandedEntry] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create") // 'create' or 'edit'
  const [currentEntry, setCurrentEntry] = useState({
    title: "",
    html: "",
    author: "",
  })

  // Fetch CSRF token
  const fetchCsrfToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/csrf-token`, {
        credentials: "include",
      })
      const data = await response.json()
      setCsrfToken(data.csrfToken)
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error)
    }
  }

  // Fetch journal entries
  const fetchEntries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog`, {
        credentials: "include",
      })
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      console.error("Failed to fetch entries:", error)
    } finally {
      setLoading(false)
    }
  }

  // Create new entry
  const createEntry = async (entryData) => {
    try {
      const entryWithDate = {
        ...entryData,
        date: new Date().toISOString(),
      }

      const response = await fetch(`${API_BASE_URL}/api/blog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(entryWithDate),
      })

      if (response.ok) {
        const newEntry = await response.json()
        setEntries([...entries, newEntry])
        setShowModal(false)
        setCurrentEntry({ title: "", html: "", author: "" })
      }
    } catch (error) {
      console.error("Failed to create entry:", error)
    }
  }

  // Update entry
  const updateEntry = async (id, entryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(entryData),
      })

      if (response.ok) {
        const updatedEntry = await response.json()
        setEntries(
          entries.map((entry) => (entry.id === id ? updatedEntry : entry))
        )
        setShowModal(false)
        setCurrentEntry({ title: "", html: "", author: "" })
      }
    } catch (error) {
      console.error("Failed to update entry:", error)
    }
  }

  // Delete entry
  const deleteEntry = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      })

      if (response.ok) {
        setEntries(entries.filter((entry) => entry.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete entry:", error)
    }
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (modalMode === "create") {
      createEntry(currentEntry)
    } else {
      updateEntry(currentEntry.id, currentEntry)
    }
  }

  // Open modal for editing
  const openEditModal = (entry) => {
    setCurrentEntry(entry)
    setModalMode("edit")
    setShowModal(true)
  }

  // Open modal for creating
  const openCreateModal = () => {
    setCurrentEntry({ title: "", html: "", author: "" })
    setModalMode("create")
    setShowModal(true)
  }

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  useEffect(() => {
    fetchCsrfToken()
    fetchEntries()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>
        <SignedIn>
          {role === "admin" && (
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              New Entry
            </button>
          )}
        </SignedIn>
      </div>

      <Accordion
        items={entries}
        expandedItem={expandedEntry}
        onToggle={(id) => setExpandedEntry(expandedEntry === id ? null : id)}
        onEdit={openEditModal}
        onDelete={deleteEntry}
        formatDate={formatDate}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === "create" ? "Create New Entry" : "Edit Entry"}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={currentEntry.title}
              onChange={(e) =>
                setCurrentEntry({
                  ...currentEntry,
                  title: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              value={currentEntry.author}
              onChange={(e) =>
                setCurrentEntry({
                  ...currentEntry,
                  author: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content (HTML)
            </label>
            <textarea
              value={currentEntry.html}
              onChange={(e) =>
                setCurrentEntry({ ...currentEntry, html: e.target.value })
              }
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
              placeholder="<p>Your content here...</p>"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {modalMode === "create" ? "Create" : "Update"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Journal
