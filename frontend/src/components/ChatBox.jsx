import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import Loader from "./Loader";

const ChatBox = ({ messages, loading }) => {
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="chat-box">
      {messages.length === 0 && !loading && (
        <div
          style={{
            textAlign: "center",
            color: "#666",
            fontStyle: "italic",
            marginTop: "50px",
          }}
        >
          Upload a document and start asking questions!
        </div>
      )}

      {messages.map((message, index) => (
        <MessageBubble key={index} role={message.role} text={message.text} />
      ))}

      {loading && <Loader />}

      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatBox;
