// routes/documentRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadDocument,
  askQuestion,
  clearDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// Configure Multer for file upload
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed!"));
    }
  },
});

// Document routes
router.post("/upload", upload.single("file"), uploadDocument);
router.post("/ask", askQuestion);
router.post("/clear", clearDocument);

export default router;
