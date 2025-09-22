# Document Q&A Backend API

An Express.js backend service for document upload, text extraction, and AI-powered question answering using Google's Gemini AI.

## Project Structure

```
backend/
├── controllers/          # Business logic handlers
│   ├── documentController.js    # Document upload, Q&A, and clear operations
│   └── healthController.js      # Health check operations
├── routes/               # API route definitions
│   ├── documentRoutes.js        # Document-related endpoints
│   └── healthRoutes.js          # Health check endpoint
├── utils/                # Utility functions
│   └── textProcessor.js         # Text chunking and relevance scoring
├── uploads/              # Temporary file storage (auto-created)
├── server.js            # Main application setup
├── package.json         # Dependencies and scripts
└── config.example.env   # Environment configuration template
```

## Features

- **File Upload & Processing**: Upload PDF and TXT files with automatic text extraction
- **Intelligent Text Chunking**: Advanced text segmentation with overlap for better context
- **Smart Relevance Search**: Multi-factor scoring algorithm to find most relevant content
- **AI-Powered Q&A**: Integration with Google Gemini AI for accurate answers
- **CORS Support**: Configured for frontend integration
- **Error Handling**: Comprehensive error handling and validation
- **Health Monitoring**: Health check and document status endpoints

## API Endpoints

### 1. File Upload

```
POST /upload
Content-Type: multipart/form-data
```

**Request:**

- `file`: PDF or TXT file (max 2MB)

**Response:**

```json
{
  "fileName": "document.pdf",
  "fileSize": "1.2 MB",
  "wordCount": 5420,
  "characterCount": 32891,
  "status": "uploaded",
  "message": "File uploaded and text extracted successfully"
}
```

**Error Response:**

```json
{
  "error": "File size must be less than 2MB"
}
```

### 2. Ask Question

```
POST /ask
Content-Type: application/json
```

**Request:**

```json
{
  "question": "What is the main topic of this document?"
}
```

**Response:**

```json
{
  "answer": "Based on the document content, the main topic is...",
  "relevanceScore": 8.5,
  "chunksUsed": 2
}
```

**Error Response:**

```json
{
  "error": "No document uploaded yet. Please upload a document first."
}
```

### 3. Health Check

```
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "hasDocument": true,
  "documentWordCount": 5420
}
```

### 4. Clear Document

```
POST /clear
```

**Response:**

```json
{
  "message": "Document cleared successfully",
  "status": "cleared"
}
```

## Setup and Installation

### Prerequisites

- Node.js 18+
- Google Gemini API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp config.example.env .env
```

Edit `.env` file:

```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 4. Start the Server

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The server will start on `http://localhost:5000`

## Text Processing Algorithm

### Intelligent Chunking

- **Sentence-based splitting**: Maintains semantic integrity
- **Overlap mechanism**: Ensures context continuity between chunks
- **Size optimization**: Balances context and processing efficiency

### Relevance Scoring

The system uses a multi-factor scoring algorithm:

1. **Exact word matches** (weight: 2.0)
2. **Partial matches** (weight: 0.5)
3. **Multiple keyword bonus** (weight: 1.5 per additional match)
4. **Proximity bonus**: Words appearing close together get higher scores
5. **Context preservation**: Overlapping chunks maintain conversation flow

### AI Integration

- **Google Gemini 1.5 Flash**: Fast, efficient text processing
- **Enhanced prompting**: Detailed instructions for accurate responses
- **Fallback handling**: Graceful handling when information isn't found
- **Multiple chunk context**: Uses top 3 most relevant chunks for comprehensive answers

## File Support

### Supported Formats

- **PDF**: Automatic text extraction using pdf-parse
- **TXT**: Direct text file reading with UTF-8 encoding

### Validation

- **File type**: Only PDF and TXT files accepted
- **File size**: Maximum 2MB per file
- **Content validation**: Ensures extractable text content
- **Error handling**: Clear error messages for invalid files

## Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Invalid file type, size, or missing content
- **500 Internal Server Error**: Processing errors with detailed logging
- **CORS errors**: Proper CORS configuration for frontend integration

## Development Features

### Logging

- Console logging for file processing
- Question tracking and chunk analysis
- Error logging with stack traces
- Performance monitoring

### File Cleanup

- Automatic cleanup of uploaded files after processing
- Memory management for large documents
- Temporary storage with automatic cleanup

## Production Considerations

### Security

- File type validation
- Size limits
- Input sanitization
- Error message sanitization in production

### Performance

- Efficient text chunking algorithm
- Optimized relevance scoring
- Memory-efficient file processing
- Automatic file cleanup

### Scalability

- In-memory storage (consider database for production)
- Stateless design for horizontal scaling
- Configurable chunk sizes and processing parameters

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not found"**

   - Ensure your `.env` file contains a valid API key
   - Check the API key has proper permissions

2. **"File upload failed"**

   - Check file size (must be < 2MB)
   - Verify file format (PDF or TXT only)
   - Ensure uploads directory exists

3. **"No text extracted"**

   - PDF might be image-based (not text-based)
   - TXT file might be empty or corrupted

4. **CORS errors**
   - Verify frontend URL in CORS configuration
   - Check if both frontend and backend are running

### Debug Mode

Run with debug logging:

```bash
NODE_ENV=development npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details
