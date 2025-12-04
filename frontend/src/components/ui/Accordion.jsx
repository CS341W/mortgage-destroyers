import { SignedIn, useUser } from "@clerk/clerk-react"

export default function Accordion({
  items,
  expandedItem,
  onToggle,
  onEdit,
  onDelete,
  formatDate,
}) {
  const { user } = useUser()
  const { role } = user?.publicMetadata || null
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No journal entries yet. Create your first one!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="border border-gray-200 rounded-lg shadow-sm"
        >
          <button
            onClick={() => onToggle(item.id)}
            className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
              <div className="text-sm text-gray-500 mt-1">
                By {item.author} • {formatDate(item.date)}
              </div>
            </div>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                expandedItem === item.id ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {expandedItem === item.id && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div
                className="text-gray-700 mb-4 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: item.html }}
              />
              <SignedIn>
                {role === "admin" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </SignedIn>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
