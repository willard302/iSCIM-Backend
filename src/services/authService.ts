import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const getCosmos = () => {
  const data = fetch("../../data/permission.json");
  console.log(data);
};

getCosmos()

export const authRegister = async (username: string, password: string) => {
  await pool.query('BEGIN');

  const checkUser = await pool.query(
    'SELECT * FROM auth WHERE username = $1',
    [username]
  );
  if (checkUser.rows.length > 0) {
    await pool.query("ROLLBACK")
    throw { status: 409, message: 'User already exists' }
  };

  // 密碼加密
  const hashedPassword = await bcrypt.hash(password, 10);

  const authResult = await pool.query(
    'INSERT INTO auth (username, password) VALUES ($1, $2) RETURNING id',
    [username, hashedPassword]
  );

  const authUser = authResult.rows[0];
  const name = username.split('@')[0];
  const invitationCode = name;
  const invitationLink = `https://iscim666-e303d.web.app?iscim_code=${name}&openExternalBrowser=1`;
  const creator = {
    id: authUser.id,
    name: name,
    email: username,
    avatar: "",
    invitationCode: invitationCode,
    invitationLink: invitationLink,
    ipoints: 0,
    level: 'Registered Member',
    tags: ['default'],
    cosmos: "cosmos",
    musictherapy: false,
    recommender: '',
    username: username,
  };

  await pool.query(
    `INSERT INTO users (id, name, email, avatar, invitationCode, invitationLink, ipoints, level, tags, cosmos, musictherapy, recommender, username)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      creator.id,
      creator.name,
      creator.email,
      creator.avatar,
      creator.invitationCode,
      creator.invitationLink,
      creator.ipoints,
      creator.level,
      creator.tags,
      creator.cosmos,
      creator.musictherapy,
      creator.recommender,
      creator.username
    ]
  );

  await pool.query('COMMIT');
};

export const authLogin = async (username:string, password:string) => {
  const result = await pool.query(
    'SELECT * FROM auth WHERE username = $1',
    [username]
  );
  if (result.rows.length === 0) {
    throw { status: 401, message: 'Invalid username or password'};
  };

  const user = result.rows[0];

  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw {status: 401, message: "passwords do not match"};
  };

  const userInfo = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [user.id]
  );

  if (result.rows.length === 0) {
    throw {
      status: 401,
      message: 'User profile not found.'
    };
  };

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '8h' }
  );

  return { success: true, token, info: userInfo.rows[0] };
};

