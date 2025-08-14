const express = require('express');
const router = express.Router();
const pool = require("../db.js");

router.get('/:user', async(req, res) => {
  const { user } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM members WHERE id = $1 RETURNING *',
      [user]
    );
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(`🔥 Error in GET members/${user}`, error.message);
    res.status(500).json({ error: error.message });
  }

});

module.exports = router;