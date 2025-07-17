// index.js
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello from Render Node.js Express API!')
})

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hi there! This is your API response.' })
})

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`)
})
