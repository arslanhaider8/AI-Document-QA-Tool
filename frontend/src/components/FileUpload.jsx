import { useState, useRef } from "react";

const FileUpload = ({ onFileUpload, uploadedFile }) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    const allowedTypes = ["application/pdf", "text/plain"];
    const allowedExtensions = [".pdf", ".txt"];

    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidType && !hasValidExtension) {
      return "Please upload only PDF or TXT files.";
    }

    // Check file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size must be less than 2MB.";
    }

    return null;
  };

  const handleFileSelect = (file) => {
    setError("");

    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    };

    onFileUpload(fileInfo);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
    // Reset file input
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      className={`file-upload ${dragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="file-input"
        accept=".pdf,.txt"
        onChange={handleFileInputChange}
      />

      <div className="file-upload-content">
        <button className="file-upload-button" onClick={handleButtonClick}>
          Choose File
        </button>

        <p className="file-upload-text">
          or drag and drop a PDF or TXT file here
          <br />
          <small>Maximum file size: 2MB</small>
        </p>
      </div>

      {uploadedFile && (
        <div className="file-info">
          <h4>📄 Uploaded File</h4>
          <div className="file-details">
            <p>
              <strong>Name:</strong> {uploadedFile.name}
            </p>
            <p>
              <strong>Size:</strong> {formatFileSize(uploadedFile.size)}
            </p>
            <p>
              <strong>Type:</strong>{" "}
              {uploadedFile.name.endsWith(".pdf")
                ? "PDF Document"
                : "Text File"}
            </p>
            {uploadedFile.wordCount && (
              <p>
                <strong>Content:</strong>{" "}
                {uploadedFile.wordCount.toLocaleString()} words,{" "}
                {uploadedFile.characterCount?.toLocaleString()} characters
              </p>
            )}
          </div>
        </div>
      )}

      {error && <div className="error-message">⚠️ {error}</div>}
    </div>
  );
};

export default FileUpload;
