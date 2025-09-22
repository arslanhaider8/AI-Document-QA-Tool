import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ChatBox from "./components/ChatBox";
import InputBar from "./components/InputBar";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (fileInfo) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", fileInfo.file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setFile({
          ...fileInfo,
          wordCount: result.wordCount,
          characterCount: result.characterCount,
        });
        // Clear previous conversation when a new file is uploaded
        setMessages([]);

        // Add a welcome message
        const welcomeMessage = {
          role: "ai",
          text: `Great! I've processed your document "${result.fileName}" (${result.wordCount} words). You can now ask me questions about its content.`,
        };
        setMessages([welcomeMessage]);
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        "Failed to upload file. Please ensure the backend server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!file) {
      alert("Please upload a document first.");
      return;
    }

    // Add user message to chat
    const userMessage = { role: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: messageText }),
      });

      const result = await response.json();

      if (response.ok) {
        const aiMessage = {
          role: "ai",
          text: result.answer,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          role: "ai",
          text: `Error: ${result.error}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = {
        role: "ai",
        text: "Sorry, I couldn't connect to the AI service. Please ensure the backend server is running and try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
        <h1 className="app-title" style={{ color: "#2563eb" , textAlign: "center" }}>Document Q&A Assistant</h1>
        <p className="app-subtitle" style={{ textAlign: "center", color: "#555" }}>
          Upload a document and ask questions about its content
        </p>

      <FileUpload onFileUpload={handleFileUpload} uploadedFile={file} />

      <div className="chat-container">
        <ChatBox messages={messages} loading={loading} />

        <InputBar
          onSend={handleSendMessage}
          disabled={loading}
          uploadedFile={file}
        />
      </div>
    </div>
  );
}

export default App;
