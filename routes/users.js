const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const allowedFields = { 
  info: "info", 
  level: "level", 
  points: "iPoints", 
  tags: "tags"
};

pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT,
    info JSONB
  );
`);

router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const fields = Object.keys(updates).filter((key) => allowedFields[key]);

  if (fields.length === 0) {
    return res.status(400).json({
      error: "No valid fields to update"
    })
  }
});

const setClauses = fields.map(
  (key, idx) => `${allowedFields[key]} = $${idx + 1}`
);

const values = fields.map((keu) => updates[key]);

try {
  const result = await pool.query(
    `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, id]
  );

  res.status(200).json({
    success: true,
    result: result.rows[0]
  });
} catch (error) {
  console.error("🔥 Error in update users", error.message);
  res.status(500).json({ error: error.message });
}

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  await pool.query('DELETE FROM users WHERE id = $1', [id])
  res.sendStatus(204)
})

module.exports = router