const express = require("express")
const router = express.Router()
const pool = require("../db.js")

pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT,
    info JSONB
  );
`);

router.put("/info/:id", async(req, res) => {
  const { id } = req.params;
  const { info } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET info = $1 WHERE id = $2 RETURNING *',
      [info, id]
    );
    res.status(200).json({ 
      success: true,
      result: result.rows[0]
    })
  } catch (error) {
    console.error(`🔥 Error in PUT /info/${id}`, error.message);
    res.status(500).json({error: error.message})
  }
  
})

router.put("/level/:id", async(req, res) => {
  const { id } = req.params;
  const { level } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET level = $1 WHERE id = $2 RETURNING *',
      [level, id]
    );
    res.status(201).json({
      success: true,
      result: result.rows[0]
    })
  } catch (error) {
    console.error(`🔥 Error in update level`, error.message);
    res.status(500).json({error: error.message})
  }
})

router.put("/points/:id", async(req, res)=> {
  const { id } = req.params;
  const { points } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET iPoints = $1 WHERE id = $2 RETURNING *',
      [points, id]
    );
    res.status(200).json({
      success: true, 
      result: result.rows[0]
    })
  } catch (error) {
    console.error(`🔥 Error in update points`, error.message);
    res.status(500).json({error: error.message})
  }
})

router.put("/tags/:id", async(req, res) => {
  const { id } = req.params;
  const { tags } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET tags = $1 WHERE id = $2 RETURNING *',
      [tags, id]
    );
    res.status(200).json({ 
      success: true, 
      result: result.rows[0] 
    })
  } catch (error) {
    console.error(`🔥 Error in update tags`, error.message);
    res.status(500).json({error: error.message})
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  await pool.query('DELETE FROM users WHERE id = $1', [id])
  res.sendStatus(204)
})

module.exports = router