import { JSONFilePreset } from "lowdb/node"
import { nanoid } from "nanoid"

const initialHistory = {
  entries: [],
}

// Persist history to a separate JSON file
let db = await JSONFilePreset("dbHistory.json", initialHistory)

async function getHistory() {
  await db.read()
  // newest first
  return [...db.data.entries].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
}

async function addHistoryEntry(entry) {
  const payload = {
    id: nanoid(8),
    createdAt: new Date().toISOString(),
    ...entry,
  }

  db.data.entries.push(payload)

  // keep only the latest 50 entries
  if (db.data.entries.length > 50) {
    db.data.entries = db.data.entries.slice(-50)
  }

  await db.write()
  return payload
}

export const mortgageHistory = {
  getHistory,
  addHistoryEntry,
}
