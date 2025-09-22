import { pool } from "../utils/db.js";

export const createChatMessage = async (req, res) => {
  try {
    const { question, answer, fileName, filePath } = req.body;
    if (!question || !answer) {
      return res
        .status(400)
        .json({ error: "question and answer are required" });
    }
    const result = await pool.query(
      `INSERT INTO chat_messages (question, answer, file_name, file_path)
       VALUES ($1, $2, $3, $4)
       RETURNING id, question, answer, file_name AS "fileName", file_path AS "filePath", created_at`,
      [question, answer, fileName || null, filePath || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const listChatMessages = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const result = await pool.query(
      `SELECT id, question, answer, file_name AS "fileName", file_path AS "filePath", created_at
       FROM chat_messages
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
