import { useState } from "react";

const InputBar = ({ onSend, disabled = false, uploadedFile }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    if (!uploadedFile) {
      alert("Please upload a document first before asking questions.");
      return;
    }

    onSend(input.trim());
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="input-bar">
      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-field"
          placeholder={
            uploadedFile
              ? "Ask a question about your document..."
              : "Upload a document first to start asking questions"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || !uploadedFile}
        />
        <button
          type="submit"
          className="send-button"
          disabled={disabled || !input.trim() || !uploadedFile}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default InputBar;
