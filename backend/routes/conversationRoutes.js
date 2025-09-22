import express from "express";
import {
  createConversation,
  listConversations,
  getConversation,
  deleteConversation,
} from "../controllers/conversationController.js";

const router = express.Router();

router.post("/conversations", createConversation);
router.get("/conversations", listConversations);
router.get("/conversations/:id", getConversation);
router.delete("/conversations/:id", deleteConversation);

export default router;
