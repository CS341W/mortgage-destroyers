import express from "express"
import { engine } from "express-handlebars"
import router from "./route-handlers.js"
const PORT = process.env.PORT || 3000
const app = express()

// Handlebars setup
app.engine("hbs", engine({ extname: ".hbs" }))
app.set("view engine", "hbs")
app.set("views", "views")

// Middleware for route handlers
app.use(router)

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`)
})
