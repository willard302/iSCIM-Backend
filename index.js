const express = require("express");
require("dotenv").config();
const cors = require("cors");

const { PORT = process.env.PORT } = process.env;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "200kb" }));

const corsOptions = {
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions))


// 路由
const productRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
app.use('/products', productRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter)

const isDev = process.env.NODE_ENV === "production";

app.listen(PORT, () => console.log( 
  isDev ? `🧪 Dev server running at http://localhost:${PORT}` : `✅ Server running on port ${PORT}`));
