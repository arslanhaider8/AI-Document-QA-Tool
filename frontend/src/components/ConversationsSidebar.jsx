import { useEffect, useState } from "react";

const ConversationsSidebar = ({ activeId, onNewChat, onSelect }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/conversations");
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load conversations", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      await fetch(`http://localhost:5000/conversations/${id}`, {
        method: "DELETE",
      });
      await loadConversations();
      if (activeId === id && typeof onSelect === "function") {
        onSelect(null);
      }
    } catch (e) {
      console.error("Failed to delete conversation", e);
    }
  };

  return (
    <div
      className="sidebar"
      style={{ width: 280, borderRight: "1px solid #e5e7eb", padding: 12 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0 }}>Chats</h3>
        <button
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={async () => {
            await onNewChat();
            loadConversations();
          }}
        >
          New Chat
        </button>
      </div>
      {loading && <div>Loading…</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {conversations.map((c) => (
          <div key={c.id} style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onSelect(c.id)}
              style={{
                flex: 1,
                textAlign: "left",
                padding: 8,
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                background: c.id === activeId ? "#eef2ff" : "white",
                cursor: "pointer",
              }}
              title={c.summary || c.title || c.id}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                {c.title || "Untitled chat"}
              </div>
              <div
                style={{
                  color: "#666",
                  fontSize: 12,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {c.summary || "(no summary yet)"}
              </div>
            </button>
            <button
              onClick={() => handleDelete(c.id)}
              title="Delete"
              style={{ padding: 8 }}
            >
              🗑️
            </button>
          </div>
        ))}
        {conversations.length === 0 && !loading && (
          <div style={{ color: "#666", fontStyle: "italic" }}>No chats yet</div>
        )}
      </div>
    </div>
  );
};

export default ConversationsSidebar;
