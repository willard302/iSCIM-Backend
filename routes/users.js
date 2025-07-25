const express = require("express")
const router = express.Router()
const pool = require("../db.js")

pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT
  );
`);

app.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send("Database error");
  }
});

router.post("/", async(req, res) => {
  const { name, email} = req.body
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  )
  res.status(201).json(result.rows[0])
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  await pool.query('DELETE FROM users WHERE id = $1', [id])
  res.sendStatus(204)
})

module.exports = router