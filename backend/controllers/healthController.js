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
