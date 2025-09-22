// routes/healthRoutes.js
import express from "express";
import { getHealth } from "../controllers/healthController.js";

const router = express.Router();

// Health check route
router.get("/health", getHealth);

export default router;
