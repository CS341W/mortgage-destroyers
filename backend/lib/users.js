import { JSONFilePreset } from "lowdb/node"
import { nanoid } from "nanoid"
import bcrypt from "bcryptjs"

const initial = { users: [] }
const db = await JSONFilePreset("dbUsers.json", initial)

async function getAll() {
  await db.read()
  return db.data.users
}

async function getByEmail(email) {
  await db.read()
  return db.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

async function getById(id) {
  await db.read()
  return db.data.users.find((u) => u.id === id)
}

async function createUser({ email, password, role = "visitor" }) {
  const existing = await getByEmail(email)
  if (existing) throw new Error("User already exists")
  const passwordHash = await bcrypt.hash(password, 12)
  const user = { id: nanoid(12), email, passwordHash, role, resetToken: null, resetTokenExp: null }
  db.data.users.push(user)
  await db.write()
  return { id: user.id, email: user.email, role: user.role }
}

async function setResetToken(email, token, exp) {
  await db.read()
  const user = db.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return null
  user.resetToken = token
  user.resetTokenExp = exp
  await db.write()
  return user
}

async function updatePasswordWithToken(token, newPassword) {
  await db.read()
  const now = Date.now()
  const user = db.data.users.find(
    (u) => u.resetToken === token && u.resetTokenExp && u.resetTokenExp > now
  )
  if (!user) return null
  user.passwordHash = await bcrypt.hash(newPassword, 12)
  user.resetToken = null
  user.resetTokenExp = null
  await db.write()
  return { id: user.id, email: user.email, role: user.role }
}

async function updateRole(id, role) {
  await db.read()
  const user = db.data.users.find((u) => u.id === id)
  if (!user) return null
  user.role = role
  await db.write()
  return { id: user.id, email: user.email, role: user.role }
}

async function ensureAdminSeed(adminEmail) {
  if (!adminEmail) return
  await db.read()
  const existing = db.data.users.find(
    (u) => u.email.toLowerCase() === adminEmail.toLowerCase()
  )
  if (existing) return
  const user = {
    id: nanoid(12),
    email: adminEmail,
    passwordHash: await bcrypt.hash(nanoid(16), 12),
    role: "admin",
    resetToken: null,
    resetTokenExp: null,
  }
  db.data.users.push(user)
  await db.write()
}

export const users = {
  getAll,
  getByEmail,
  getById,
  createUser,
  setResetToken,
  updatePasswordWithToken,
  updateRole,
  ensureAdminSeed,
}
