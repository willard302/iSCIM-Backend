const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: '請填寫所有欄位' });
  };

  try {
    const checkUser = await pool.query(
      'SELECT * FROM auth WHERE username = $1 OR email = $1',
      [username]
    );

    if (checkUser.rows.length > 0) {
      return res.status(409).json({ error: '使用者已存在' });
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const authResult = await client.query(
        'INSERT INTO auth (username, password) VALUES ($1, $2) RETURNING id, username',
        [username, hashedPassword]
      );
      const authId = authResult.rows[0].id;

      await client.query(
        'INSERT INTO users (email) VALUES ($1) returning id, email',
        [username]
      )

    } catch (error) {
      console.error('註冊錯誤:', error);
    }

    

    pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $1)',
      [username]
    );

    res.status(201).json({
      message: '註冊成功',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

router.post('/login', async(req, res) => {
  const {username, password} = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM auth WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({message: 'Invalid username or password'});
    };

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({message: "passwords do not match"});

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '8h' }
    );

    res.json({ message: '登入成功', token});
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤'})
  }
});

module.exports = router;