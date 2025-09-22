// routes/healthRoutes.js
import express from "express";
import { getHealth, getDbHealth } from "../controllers/healthController.js";

const router = express.Router();

// Health check route
router.get("/health", getHealth);
router.get("/health/db", getDbHealth);

export default router;
