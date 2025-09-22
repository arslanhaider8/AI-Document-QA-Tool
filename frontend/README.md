# Document Q&A Frontend

A minimal React web application for uploading documents and asking questions about their content.

## Features

- **File Upload**: Upload PDF and TXT files (max 2MB) with drag & drop support
- **Document Validation**: Automatic file type and size validation
- **Chat Interface**: Conversational UI for asking questions about uploaded documents
- **Real-time Feedback**: Loading states and error handling
- **Responsive Design**: Works on desktop and mobile devices

## Components

### 1. FileUpload

- Accepts only .pdf and .txt files
- Validates file type and size (rejects files > 2MB)
- Shows uploaded file information
- Displays clear error messages for invalid uploads

### 2. ChatBox

- Container for the conversation history
- Renders MessageBubble components
- Auto-scrolls to show new messages
- Shows welcome message when empty

### 3. MessageBubble

- Individual chat message component
- Props: `role` (user | ai), `text`
- User messages: right-aligned, blue background
- AI messages: left-aligned, gray background

### 4. InputBar

- Text input for entering questions
- Submit on button click or Enter key press
- Clears input after sending
- Disabled until document is uploaded

### 5. Loader

- Simple animated loading indicator
- Shows "AI is thinking..." message
- Appears while waiting for responses

## Setup and Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Build for production**:

   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Usage

1. **Upload a Document**: Click "Choose File" or drag & drop a PDF or TXT file
2. **Ask Questions**: Type your question in the input field and press Enter or click Send
3. **View Responses**: The AI responses will appear in the chat interface

## State Management

The application uses React hooks for state management:

- `file`: Stores uploaded file metadata (name, size, type)
- `messages`: Array of message objects with `{ role, text }`
- `loading`: Boolean for showing/hiding the loader
- `input`: Controlled state for the input field

## Technical Stack

- **React 19**: Frontend framework
- **Vite**: Build tool and development server
- **CSS3**: Styling with responsive design
- **ES6+**: Modern JavaScript features

## Development

The project uses Vite for fast development and building. The development server includes:

- Hot Module Replacement (HMR)
- Fast refresh for React components
- Automatic browser opening
- ESLint integration

## Notes

This is a frontend-only implementation with simulated AI responses. In a production environment, you would need to:

1. Connect to a backend API for document processing
2. Implement actual AI/ML services for question answering
3. Add user authentication if required
4. Implement proper error handling and retry logic
5. Add document storage and management features

## Browser Support

The application supports all modern browsers including:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
