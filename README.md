# AI Powered Document Q&A Tool

This project implements a document-based question-answering system that allows users to upload documents and ask questions about their content. The application uses Google's Gemini AI to provide accurate, context-aware responses based on the uploaded documents.

## Overview

The application consists of two main components:
- A React-based frontend for document upload and user interaction
- A Node.js/Express backend that processes documents and handles AI interactions

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Google Cloud API key with Gemini AI access

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   NODE_ENV=development
   GEMINI_API_KEY=your_api_key_here
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   MAX_FILE_SIZE=2097152
   ALLOWED_FILE_TYPES=application/pdf,text/plain
   CHUNK_SIZE=400
   CHUNK_OVERLAP=50
   MAX_CHUNKS_FOR_CONTEXT=3
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

## Assumptions Made

1. Document Processing:
   - Documents are text-based (PDF or TXT formats)
   - Documents are in English
   - File size is limited to 2MB
   - Documents contain primarily text content (not heavily image-based)

2. User Interface:
   - Users have basic familiarity with web interfaces
   - Single document processing at a time
   - Questions are related to the uploaded document's content

3. System Requirements:
   - Modern web browser with JavaScript enabled
   - Stable internet connection for AI API calls
   - Sufficient system memory for document processing

## Potential Improvements

1. Technical Enhancements:
   - Implement document caching for faster repeated queries
   - Add support for more file formats (DOC, DOCX, etc.)
   - Implement batch document uploads
   - Add document preprocessing for better text extraction
   - Implement rate limiting and request queuing

2. User Experience:
   - Add document preview functionality
   - Implement highlighting of relevant text in documents
   - Add support for document sections and targeted questions
   - Implement user authentication and document management
   - Add history of questions and answers

3. AI and Processing:
   - Implement multiple AI model support
   - Add support for multilingual documents
   - Improve context handling for more accurate answers
   - Add document summarization features
   - Implement answer confidence scoring

4. Security and Performance:
   - Add document encryption at rest
   - Implement advanced error handling and recovery
   - Add request caching and optimization
   - Implement content validation and sanitization
   - Add automated testing for AI responses

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.