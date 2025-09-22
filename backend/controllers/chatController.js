import { pool } from "../utils/db.js";

export const createChatMessage = async (req, res) => {
  try {
    const { question, answer, fileName, filePath, conversationId } = req.body;
    if (!question || !answer) {
      return res
        .status(400)
        .json({ error: "question and answer are required" });
    }
    const result = await pool.query(
      `INSERT INTO chat_messages (question, answer, file_name, file_path, conversation_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, question, answer, file_name AS "fileName", file_path AS "filePath", conversation_id AS "conversationId", created_at`,
      [
        question,
        answer,
        fileName || null,
        filePath || null,
        conversationId || null,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const listChatMessages = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const conversationId = req.query.conversationId || null;
    const result = conversationId
      ? await pool.query(
          `SELECT id, question, answer, file_name AS "fileName", file_path AS "filePath", conversation_id AS "conversationId", created_at
           FROM chat_messages
           WHERE conversation_id = $1
           ORDER BY created_at DESC
           LIMIT $2`,
          [conversationId, limit]
        )
      : await pool.query(
          `SELECT id, question, answer, file_name AS "fileName", file_path AS "filePath", conversation_id AS "conversationId", created_at
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
