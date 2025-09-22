import { useEffect, useState } from "react";
import FileUpload from "./components/FileUpload";
import ChatBox from "./components/ChatBox";
import InputBar from "./components/InputBar";
import ConversationsSidebar from "./components/ConversationsSidebar";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [fileMeta, setFileMeta] = useState(null); // keeps name/path when chip hidden
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);

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
          filePath: result.filePath,
        });
        // Clear previous conversation when a new file is uploaded
        setMessages([]);
        // Start a new conversation automatically on first upload if none exists
        if (!activeConversationId) {
          try {
            const convRes = await fetch("http://localhost:5000/conversations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: result.fileName }),
            });
            const conv = await convRes.json();
            if (convRes.ok && conv?.id) setActiveConversationId(conv.id);
          } catch {}
        }

        // Preserve metadata for later asks, keep chip visible
        setFileMeta({ name: result.fileName, filePath: result.filePath });

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
    if (!file && !fileMeta) {
      alert("Please upload a document first.");
      return;
    }

    // Add user message to chat
    const userMessage = { role: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Ensure we have a conversation before sending
      let convId = activeConversationId;
      if (!convId) {
        const res = await fetch("http://localhost:5000/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const conv = await res.json();
        if (res.ok && conv?.id) {
          convId = conv.id;
          setActiveConversationId(conv.id);
        }
      }
      const response = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: messageText,
          fileName: file?.name || fileMeta?.name,
          filePath: file?.filePath || fileMeta?.filePath,
          conversationId: convId,
        }),
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
      // Hint sidebar to refresh: reload conversations list by toggling active id (no custom events)
      // The sidebar fetches on mount only; we can re-mount it by forcing a key change
      // (Simpler alternative: user can click away; keeping minimal change now)
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

  const handleNewChat = async () => {
    // Do not create a new conversation if no current file is uploaded
    if (!file) {
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: file?.name || undefined }),
      });
      const conv = await res.json();
      if (res.ok && conv?.id) {
        setActiveConversationId(conv.id);
        setMessages([]);
        // After creating a conversation from the current file, clear file references
        setFile(null);
        setFileMeta(null);
      }
    } catch (e) {
      console.error("Failed to create conversation", e);
    }
  };

  const handleSelectConversation = async (id) => {
    setActiveConversationId(id);
    try {
      const res = await fetch(`http://localhost:5000/conversations/${id}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data?.messages)) {
        // Expand each DB row into two bubbles: user question then AI answer
        const transformed = data.messages.flatMap((m) => [
          { role: "user", text: m.question },
          { role: "ai", text: m.answer },
        ]);
        setMessages(transformed);
      }
    } catch (e) {
      console.error("Failed to load conversation", e);
    }
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <ConversationsSidebar
          activeId={activeConversationId}
          onNewChat={handleNewChat}
          onSelect={handleSelectConversation}
        />
      </div>
      <div className="main">
        <header>
          <h1 className="app-title" style={{ color: "#2563eb" }}>
            Document Q&A Assistant
          </h1>
          <p className="app-subtitle" style={{ color: "#555" }}>
            Upload a document and ask questions about its content
          </p>
        </header>

        <FileUpload
          onFileUpload={handleFileUpload}
          uploadedFile={file}
          onClear={async () => {
            try {
              await fetch("http://localhost:5000/clear", { method: "POST" });
            } catch {}
            setFile(null);
            setFileMeta(null);
            setMessages([]);
          }}
        />

        <div className="chat-container">
          <ChatBox messages={messages} loading={loading} />
          <InputBar
            onSend={handleSendMessage}
            disabled={loading}
            uploadedFile={file || fileMeta}
          />
          <footer className="app-footer">
            <p>
              © {new Date().getFullYear()} AI Powered Document Q&A Tool · Built
              with react and Express.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
