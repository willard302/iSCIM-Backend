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

router.put("/:id", async(req, res) => {
  const { id } = req.params;
  const { info } = req.body
  const result = await pool.query(
    'UPDATE users SET info = $1 WHERE id = $2',
    [info, id]
  );
  res.status(201).json(result.rows[0])
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  await pool.query('DELETE FROM users WHERE id = $1', [id])
  res.sendStatus(204)
})

module.exports = router