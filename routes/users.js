const express = require("express")
const router = express.Router()
const client = require("../db.js")

client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT
  );
`);

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await client.query("SELECT * FROM users", [id]);
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send("Database error");
  }
});

router.post("/:id", async(req, res) => {
  const { id } = req.params;
  const { info } = req.body
  const result = await client.query(
    'UPDATE users SET info = $1 WHERE id = $2',
    [info, id]
  );
  res.status(201).json(result.rows[0])
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  await client.query('DELETE FROM users WHERE id = $1', [id])
  res.sendStatus(204)
})

module.exports = router