import express from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import csrf from "csurf"
import cors from "cors"
import dotenv from "dotenv"
import { database } from "./persistent-database.js" // or use "./in-memory-database.js"
import { blogDatabase } from "./blog-database.js"
import { mortgageHistory } from "./mortgage-history.js"
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
const csrfProtection = csrf({
  // Cookie is required for browser clients; secure/sameSite set for cross-site
  cookie: {
    sameSite: "none",
    secure: true,
  },
})
router.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  })
)

// Configure for multi-part, form-based file uploads
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

// Mortgage calculator history routes
router.get("/api/mortgage-history", async (_req, res) => {
  try {
    const history = await mortgageHistory.getHistory()
    res.json(history)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch mortgage history" })
  }
})

router.post("/api/mortgage-history", csrfProtection, async (req, res) => {
  try {
    const entry = await mortgageHistory.addHistoryEntry({
      _csrf: undefined, // do not persist CSRF token
      inputs: req.body.inputs,
      results: req.body.results,
      label: req.body.label || null,
    })
    res.status(201).json(entry)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to save mortgage history" })
  }
})

router.delete(
  "/api/mortgage-history/:id",
  csrfProtection,
  async (req, res) => {
    try {
      const removed = await mortgageHistory.removeHistoryEntry(req.params.id)
      if (!removed) {
        return res.status(404).json({ error: "History entry not found" })
      }
      res.status(204).end()
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Failed to delete mortgage history" })
    }
  }
)

// Email mortgage summary
router.post("/api/mortgage-email", csrfProtection, async (req, res) => {
  try {
    const { email, inputs, results } = req.body
    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }
    if (!process.env.FROM_EMAIL) {
      return res
        .status(500)
        .json({ error: "FROM_EMAIL is not configured on the server" })
    }

    const textLines = [
      "Your Mortgage Calculation",
      "",
      `Home price: $${Number(inputs?.homePrice || 0).toLocaleString()}`,
      `Down payment: ${inputs?.downPaymentPercent || 0}%`,
      `Rate / Term: ${inputs?.interestRate || 0}% / ${inputs?.termYears || 0} years`,
      `Monthly total: $${Number(results?.totalMonthly || 0).toLocaleString()}`,
      "",
      "Sent from Mortgage Destroyers.",
    ]

    const html = `
      <h2>Your Mortgage Calculation</h2>
      <p><strong>Home price:</strong> $${Number(inputs?.homePrice || 0).toLocaleString()}</p>
      <p><strong>Down payment:</strong> ${inputs?.downPaymentPercent || 0}%</p>
      <p><strong>Rate / Term:</strong> ${inputs?.interestRate || 0}% / ${inputs?.termYears || 0} years</p>
      <p><strong>Monthly total:</strong> $${Number(results?.totalMonthly || 0).toLocaleString()}</p>
      <p style="margin-top:12px;color:#475467;font-size:13px;">Sent from Mortgage Destroyers.</p>
    `

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Your Mortgage Calculation Summary",
      text: textLines.join("\n"),
      html,
    }

    await sgMail.send(msg)
    res.json({ success: true })
  } catch (error) {
    console.error("SendGrid email error:", error)
    res.status(500).json({ error: "Failed to send email" })
  }
})

export default router
