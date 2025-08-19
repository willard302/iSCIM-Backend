const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const permission = require('../data/permission.json')

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Wrong account or password' });
  };

  try {
    await pool.query('BEGIN');

    const checkUser = await pool.query(
      'SELECT * FROM auth WHERE username = $1',
      [username]
    );

    if (checkUser.rows.length > 0) {
      await pool.query("ROLLBACK")
      return res.status(409).json({ error: 'User already exists' });
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const authResult = await pool.query(
      'INSERT INTO auth (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashedPassword]
    );
    const authUser = authResult.rows[0];
    const name = username.split('@')[0];
    const invitation = { code: name, link: `https://iscim666-e303d.web.app?iscim_code=${name}&openExternalBrowser=1` };
    const creator = {
      id: authUser.id,
      info: { name: name, avatar: "" },
      invitation: invitation,
      ipoints: 0,
      level: 'Registered Member',
      members: ['default'],
      permission: permission,
      recommender: '',
      username: username,
    }

    await pool.query(
      'INSERT INTO users (id, info, invitation, ipoints, level, members, permission, recommender, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [creator.id, creator.info, creator.invitation, creator.ipoints, creator.level, creator.members, creator.permission, creator.recommender, creator.username]
    )

    await pool.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(400).json({ 
      success: false,
      message: 'User registered failed',
    });
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

    const userInfo = await pool.query(
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