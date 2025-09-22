// controllers/documentController.js
import fs from "fs";
import { createRequire } from "module";
// Workaround pdf-parse debug code when imported under ESM by requiring the library implementation directly
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
import { GoogleGenerativeAI } from "@google/generative-ai";
import { chunkText, calculateRelevanceScore } from "../utils/textProcessor.js";
import { pool } from "../utils/db.js";

// Lazy Gemini model getter to ensure env vars are loaded before use
function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please configure your .env file."
    );
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
}

// Temporary in-memory storage
let extractedText = "";
let uploadedFileName = "";
let uploadedFilePath = "";

/**
 * Upload and process document (PDF or TXT)
 */
export const uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: "No file uploaded. Please select a PDF or TXT file to upload.",
      });
    }

    console.log(`Processing file: ${file.originalname} (${file.mimetype})`);

    let textContent = "";

    if (file.mimetype === "text/plain") {
      textContent = fs.readFileSync(file.path, "utf8");
    } else if (file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      textContent = pdfData.text;
    } else {
      // Cleanup file and return error
      fs.unlinkSync(file.path);
      return res.status(400).json({
        error: "Unsupported file type. Please upload a PDF or TXT file.",
      });
    }

    // Validate extracted text
    if (!textContent || textContent.trim().length === 0) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        error:
          "No text content could be extracted from the file. Please ensure the file contains readable text.",
      });
    }

    // Store extracted text and file metadata
    extractedText = textContent.trim();
    uploadedFileName = file.originalname;
    uploadedFilePath = file.path;

    // Keep file on disk so we can persist file_path (you can clean up later if desired)

    const wordCount = extractedText.split(/\s+/).length;
    const characterCount = extractedText.length;

    console.log(
      `Successfully extracted ${wordCount} words from ${file.originalname}`
    );

    res.json({
      fileName: file.originalname,
      filePath: file.path,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      wordCount: wordCount,
      characterCount: characterCount,
      status: "uploaded",
      message: "File uploaded and text extracted successfully",
    });
  } catch (err) {
    console.error("Error in upload endpoint:", err);

    // Cleanup file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.error("Error cleaning up file:", cleanupErr);
      }
    }

    res.status(500).json({
      error: "An error occurred while processing the file. Please try again.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Ask question about uploaded document
 */
export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    // Validation
    if (!extractedText) {
      return res.status(400).json({
        error: "No document uploaded yet. Please upload a document first.",
      });
    }
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        error: "Question is required and cannot be empty.",
      });
    }

    console.log(`Processing question: "${question}"`);

    // Split text into intelligent chunks
    const chunks = chunkText(extractedText, 500, 60);
    console.log(`Created ${chunks.length} chunks from document`);

    // Find most relevant chunks using improved scoring
    const stopwords = new Set([
      "the",
      "is",
      "in",
      "at",
      "of",
      "a",
      "an",
      "and",
      "or",
      "to",
      "for",
      "on",
      "by",
      "with",
      "as",
      "from",
      "that",
      "this",
      "it",
      "are",
      "was",
      "be",
      "been",
      "were",
      "than",
      "then",
      "but",
      "so",
      "if",
      "into",
      "about",
    ]);
    const scoredChunks = chunks
      .map((chunk, index) => ({
        chunk,
        score: calculateRelevanceScore(
          chunk,
          question
            .split(/\s+/)
            .filter((w) => !stopwords.has(w.toLowerCase()))
            .join(" ")
        ),
        index,
      }))
      .sort((a, b) => b.score - a.score);

    // Use top 2-3 most relevant chunks for better context (fallback to first chunks if all scores are 0)
    let topChunks = scoredChunks.slice(0, 3).filter((item) => item.score > 0);
    if (topChunks.length === 0) {
      topChunks = scoredChunks.slice(0, 2);
    }

    // If still no chunks (empty doc), return not found
    if (topChunks.length === 0) {
      console.log("No content available to search");
      return res.json({
        answer: "I couldn't find that information in the provided document.",
      });
    }

    // Combine top chunks for context
    const relevantText = topChunks
      .map((item) => item.chunk)
      .join("\n\n---\n\n");
    console.log(
      `Using ${topChunks.length} relevant chunks (scores: ${topChunks
        .map((c) => c.score.toFixed(2))
        .join(", ")})`
    );

    // Enhanced prompt for better AI responses
    const prompt = `You are a helpful AI assistant analyzing a document. You have been given the most relevant excerpts from a document to answer a user's question.

Document excerpts:
${relevantText}

User question: ${question}

Instructions:
1. Answer the question using ONLY the information provided in the document excerpts above
2. Be specific and cite relevant details from the text
3. If the answer is not clearly stated in the excerpts, respond with: "I couldn't find that information in the provided document."
4. Keep your response concise but informative
5. If you find partial information, mention what you found and what might be missing

Answer:`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    console.log("Generated response successfully");
    // Persist Q&A to database (non-blocking), include file metadata if available
    try {
      const fileNameForRow =
        req.body?.fileName || req.query?.fileName || uploadedFileName || null;
      const filePathForRow =
        req.body?.filePath || req.query?.filePath || uploadedFilePath || null;
      await pool.query(
        `INSERT INTO chat_messages (question, answer, file_name, file_path)
         VALUES ($1, $2, $3, $4)`,
        [question, answer?.trim() || "", fileNameForRow, filePathForRow]
      );
    } catch (dbErr) {
      console.error("[db] Failed to persist chat message:", dbErr);
    }
    res.json({
      answer: answer.trim(),
      relevanceScore: topChunks[0]?.score || 0,
      chunksUsed: topChunks.length,
    });
  } catch (err) {
    console.error("Error in ask endpoint:", err);
    res.status(500).json({
      error:
        "An error occurred while processing your question. Please try again.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Clear uploaded document from memory
 */
export const clearDocument = (req, res) => {
  extractedText = "";
  res.json({
    message: "Document cleared successfully",
    status: "cleared",
  });
};
