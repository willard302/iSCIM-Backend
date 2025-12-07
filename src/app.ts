import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.js';
import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "200kb" }));
app.use(express.static("public"));

// CORS 設定
const corsOptions = {
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 路由
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);

// ⚠️ 注意：錯誤處理 middleware 要放在所有 routes 後面
app.use(errorHandler);

export default app;