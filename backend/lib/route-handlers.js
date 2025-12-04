import express from "express"
import multer from "multer"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import csrf from "csurf"
import cors from "cors"
import dotenv from "dotenv"
import { database } from "./persistent-database.js" // or use "./in-memory-database.js"
import { blogDatabase } from "./blog-database.js"
import path from "path"
import sgMail from "@sendgrid/mail"

const router = express.Router() // Create a router

/**
 * Mount Middleware
 */

// Public files, form data, JSON, CSRF protection, and CORS
router.use(express.static("public"))
router.use(express.static("uploads"))
router.use(bodyParser.urlencoded({ extended: false }))
router.use(express.json())
router.use(cookieParser())
const csrfProtection = csrf({ cookie: true })
router.use(
  cors({
    origin: true, // Allows any origin
    credentials: true,
  })
)

// Configure for multi-part, form-based file uploads
const upload = multer({ dest: "uploads/" })

// configure for handling credentials stored in .env
dotenv.config()

// configure SendGrid API
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

/**
 * Route Definitions
 */

// Journal signup route with email integration
router.post("/api/journal-signup", csrfProtection, async (req, res) => {
  try {
    const { email, name } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL, // Your verified sender
      subject: "Welcome to Our Journal!",
      text: `Hello ${
        name || "there"
      },\n\nThank you for signing up for our journal! We're excited to have you on board.\n\nBest regards,\nThe Team`,
      html: `<p>Hello ${
        name || "there"
      },</p><p>Thank you for signing up for our journal! We're excited to have you on board.</p><p>Best regards,<br>The Team</p>`,
    }

    await sgMail.send(msg)
    res.json({ success: true, message: "Welcome email sent successfully" })
  } catch (error) {
    console.error("SendGrid error:", error)
    res.status(500).json({ error: "Failed to send email" })
  }
})

// Home route
router.get("/", async (req, res) => {
  try {
    const users = await database.getUsers()
    res.render("home", { users })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
})

// Users route
router.get("/users", async (req, res) => {
  try {
    const users = await database.getUsers()
    res.render("users", { users })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
})

// Signup route
router.get("/signup", csrfProtection, async (req, res) => {
  const csrfToken = req.csrfToken()
  try {
    const users = await database.getUsers()
    res.render("signup", { csrfToken, users })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
})

// Create user route
router.post(
  "/users/create",
  upload.single("avatar"),
  csrfProtection,
  async (req, res) => {
    let fileName = null
    if (req.file) {
      const ext = path.extname(req.file.originalname)
      fileName = `${req.file.filename}${ext}`
      const fs = await import("fs/promises")
      await fs.rename(req.file.path, path.join(req.file.destination, fileName))
    }
    const userData = {
      ...req.body,
      portrait_img: fileName,
    }
    try {
      await database.addUser(userData)
      res.redirect("/users")
    } catch (error) {
      console.error(error)
      res.status(500).send("Internal Server Error")
    }
  }
)

// Delete user route
router.post("/users/delete/:id", async (req, res) => {
  try {
    await database.removeUser(req.params.id)
    res.redirect("/users")
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
})

// Favorite user route
router.post("/users/favorite/:id", async (req, res) => {
  try {
    await database.favoriteUser(req.params.id)
    res.redirect("/users")
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
})

// Route for CSRF token (when needed)
router.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// Blog API routes
router.get("/api/blog", csrfProtection, async (req, res) => {
  try {
    const entries = await blogDatabase.getBlogEntries()
    res.json(entries)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch blog entries" })
  }
})

router.post("/api/blog", csrfProtection, async (req, res) => {
  try {
    const newEntry = await blogDatabase.addBlogEntry(req.body)
    res.status(201).json(newEntry)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create blog entry" })
  }
})

router.put("/api/blog/:id", csrfProtection, async (req, res) => {
  try {
    const updatedEntry = await blogDatabase.updateBlogEntry(
      req.params.id,
      req.body
    )
    if (!updatedEntry) {
      return res.status(404).json({ error: "Blog entry not found" })
    }
    res.json(updatedEntry)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update blog entry" })
  }
})

router.delete("/api/blog/:id", csrfProtection, async (req, res) => {
  try {
    const deleted = await blogDatabase.deleteBlogEntry(req.params.id)
    if (!deleted) {
      return res.status(404).json({ error: "Blog entry not found" })
    }
    res.json({ message: "Blog entry deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to delete blog entry" })
  }
})

export default router
