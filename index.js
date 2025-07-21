const express = require("express");
const path = require("path");
const { Pool } = require("pg")
const { PORT = 9527, HOST = "localhost" } = process.env;

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "200kb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
})

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch(err => console.error("PostgreSQL connection error", err));

app.get("/list", async(req, res) => {
  try {
    const result = await pool.query("Select * From list");
    res.json(result.rows);
  } catch (error) {
    res.status(500).send("Database error")
  }
});

app.listen(PORT, () => console.log(`app started at http://${HOST}:${PORT}`));