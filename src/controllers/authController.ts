import type { Request, Response, NextFunction } from "express";
import type { authType } from "../types/auth.ts";
import { authRegister, authLogin } from "../services/authService";

export const register = async (req: Request<{}, {}, authType>, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({error: 'Wrong account or password'})
    }

    await authRegister(username, password);
    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch(error) {
    next(error);
  }
};

export const login = async (req:Request<{}, {}, authType>, res:Response, next:NextFunction) => {
  try {
    const { username, password } = req.body;
    const  result = await authLogin(username, password);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}