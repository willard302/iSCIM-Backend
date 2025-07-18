const express = require("express");
const path = require("path");
const _ = require("lodash");
const { Pool } = require("pg")
const { PORT = 9527, HOST = "localhost" } = process.env;

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "200kb" }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch(err => console.error("PostgreSQL connection error", err));

require("dotenv").config();

app.get("/users", async(req, res) => {
  try {
    const result = await pool.query("Select * From users")
    res.json(result.rows)
  } catch (error) {
    res.status(500).send("Database error")
  }
});

app.listen(PORT, () => console.log(`app started at http://${HOST}:${PORT}`));