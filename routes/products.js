const express = require('express');
const router = express.Router();
const pool = require('../db');

// 取得所有商品
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('取得商品資料錯誤:', error);
    res.status(500).json({ error: '無法取得商品資料' });
  }
});

// 取得單一商品
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "can't find product" });
    };

    res.json(result.rows[0]);
  } catch (error) {
    console.error('查詢商品失敗:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;