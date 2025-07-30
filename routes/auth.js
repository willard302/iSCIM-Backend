const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const client = require('../db');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Wrong account or password' });
  };

  try {
    await client.query('BEGIN');

    const checkUser = await client.query(
      'SELECT * FROM auth WHERE username = $1',
      [username]
    );

    if (checkUser.rows.length > 0) {
      await client.query("ROLLBACK")
      return res.status(409).json({ error: 'User already exists' });
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const authResult = await client.query(
      'INSERT INTO auth (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashedPassword]
    );
    const authUser = authResult.rows[0];

    await client.query(
      'INSERT INTO users (id, email) VALUES ($1, $2)',
      [authUser.id, username]
    )

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      user: authResult
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server Error' })
  }
})

router.post('/login', async(req, res) => {
  const {username, password} = req.body;

  try {
    const result = await client.query(
      'SELECT * FROM auth WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({message: 'Invalid username or password'});
    };

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({message: "passwords do not match"});

    const userInfo = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [user.id]
    )

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '8h' }
    );

    res.json({ success: true, token, info: userInfo});
  } catch (error) {
    res.status(500).json({ message: 'Server Error'})
  }
});

module.exports = router;