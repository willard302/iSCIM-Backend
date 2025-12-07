import pool from "../config/db.js";
import type { User } from "../types/user.js";

export const get = async (id: number): Promise<User | null> => {
  const result = await pool.query<User>(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

export const create = async (user: Omit<User, "id">): Promise<User> => {
  const keys = Object.keys(user);
  const values = Object.values(user);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
    INSERT INTO users (${keys.join(", ")})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query<User>(query, values);
  if (!result.rows[0]) {
    throw new Error("Failed to create user");
  }
  return result.rows[0];
}

export const update = async (fields: string[], values: any[], id:number): Promise<User> => {
  const setClauses = fields.map((key, idx) => `${key} = $${idx + 1}`);
  const query = `
    UPDATE users
    SET ${setClauses.join(", ")}
    WHERE id = $${fields.length + 1}
    RETURNING *
  `;
  const result = await pool.query<User>(query, [...values, id]);

  if (!result.rows[0]) {
    throw new Error("Failed to update user")
  }
  return result.rows[0];
};

export const remove = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};