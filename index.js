require("dotenv").config
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const usersRouter = require("./routes/users")

app.use(express.json())
app.use("/users", usersRouter)

app.get("users", async(req, res) => {
  const result = await pool.query("SELECT * FROM users")
  res.json(result.rows)
})

app.get('/', (req, res) => {
  res.send('Hello from Render Node.js Express API!')
})

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hi there! This is your API response.' })
})

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`)
})
