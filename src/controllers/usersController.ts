import type { Request, Response, NextFunction } from "express";
import {usersServiceDelete, usersServiceUpdate} from "../services/usersService";

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params;
    const updates = req.body;

    const result = await usersServiceUpdate(updates, Number(id));
    if (!result) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    };
    res.status(200).json({
      success: true,
      result: result
    });

  } catch (error) {
    next(error);
  };
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await usersServiceDelete(Number(id));
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}