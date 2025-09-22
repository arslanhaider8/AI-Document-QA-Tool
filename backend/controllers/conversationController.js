import { pool } from "../utils/db.js";

export const createConversation = async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      `INSERT INTO conversations (title) VALUES ($1) RETURNING id, title, created_at, updated_at`,
      [title || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const listConversations = async (req, res) => {
  try {
    const result = await pool.query(
      `WITH latest AS (
         SELECT DISTINCT ON (conversation_id)
           conversation_id,
           question,
           answer,
           created_at
         FROM chat_messages
         WHERE conversation_id IS NOT NULL
         ORDER BY conversation_id, created_at DESC
       )
       SELECT c.id,
              c.title,
              COALESCE(c.title,
                       CASE WHEN l.question IS NOT NULL
                            THEN LEFT(l.question, 60)
                            ELSE '(empty)'
                       END) AS summary,
              c.created_at,
              c.updated_at
       FROM conversations c
       LEFT JOIN latest l ON l.conversation_id = c.id
       ORDER BY c.updated_at DESC, c.created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const conv = await pool.query(
      `SELECT id, title, created_at, updated_at FROM conversations WHERE id = $1`,
      [id]
    );
    if (conv.rows.length === 0)
      return res.status(404).json({ error: "not found" });
    const messages = await pool.query(
      `SELECT id, question, answer, file_name AS "fileName", file_path AS "filePath", created_at
       FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [id]
    );
    return res.json({ ...conv.rows[0], messages: messages.rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM conversations WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "not found" });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
