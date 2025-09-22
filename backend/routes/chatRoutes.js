import express from "express";
import {
  createChatMessage,
  listChatMessages,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/chat-messages", createChatMessage);
router.get("/chat-messages", listChatMessages);

export default router;
