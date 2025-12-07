import * as usersModel from "../models/usersModel.js";
import type { User } from "../types/user.js";

const allowedFields = [
  "name", "email", "gender", "phone", "birthday", "level", "ipoints", "cosmos",
  "country", "coutryIdx", "city", "cityIdx", "geo",
  "invitationCode", "invitationLink",
  "musictherapy", "recommender"
];

export const usersServiceUpdate = async (updates: Partial<User>, id: number): Promise<User> => {
  const fields = Object.keys(updates).filter((key) => allowedFields.includes(key));

  if (fields.length === 0) throw new Error("No valid fields to update");

  const values = fields.map((key) => updates[key as keyof User]);
  return await usersModel.update(fields, values, id);
};

export const usersServiceDelete = async (id: number): Promise<void> => {
  return await usersModel.remove(id);
};