const express = require("express");
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
const accountRouter = require('./routes/auth');
const userRouter = require('./routes/users');
app.use('/products', productRouter);
app.use('/auth', accountRouter);
app.use('/users', userRouter)

const isDev = process.env.NODE_ENV === "production";

app.listen(PORT, () => console.log( 
  isDev ? `🧪 Dev server running at http://localhost:${PORT}` : `✅ Server running on port ${PORT}`));
