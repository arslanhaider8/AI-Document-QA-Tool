// controllers/healthController.js

/**
 * Health check endpoint
 */
export const getHealth = (req, res) => {
  // Note: extractedText is handled in documentController
  // This is a simple health check without document status
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

export const getDbHealth = async (req, res) => {
  try {
    const { pool } = await import("../utils/db.js");
    const result = await pool.query("SELECT now() AS now");
    return res.json({
      status: "ok",
      now: result.rows?.[0]?.now,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", error: err.message });
  }
};
