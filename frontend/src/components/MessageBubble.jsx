const MessageBubble = ({ role, text }) => {
  return (
    <div className={`message-bubble ${role}`}>
      <div className="message-role">
        {role === "user" ? "You" : "AI Assistant"}
      </div>
      <div className="message-content">{text}</div>
    </div>
  );
};

export default MessageBubble;
