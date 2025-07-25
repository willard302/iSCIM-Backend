const express = require("express");
const pool = require("./db");
require("dotenv").config();

const { PORT = process.env.PORT } = process.env;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "200kb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// 路由
const productRouter = require('./routes/products');
const accountRouter = require('./routes/accounts');
app.use('/products', productRouter);
app.use('/accounts', accountRouter);

app.get("/users", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send("Database error");
  }
});

app.listen(PORT, () => console.log(`✅ App started on port ${PORT}`));
