# AI Component Generator Platform

> A stateful, AI-driven micro-frontend playground where authenticated users can iteratively generate, preview, tweak, and export React components with full chat history and code edits preserved across sessions.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://mongodb.com/)

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd component-and-multi-component-generator-platform

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

**Demo Credentials:** `demo@example.com` / `demo123`

## Features

### Core Features
- **Authentication & Persistence**: Secure signup/login with session management
- **Conversational UI**: Side-panel chat with text and image inputs for AI-driven component generation
- **Live Preview**: Real-time micro-frontend rendering of generated components
- **Code Inspection & Export**: Syntax-highlighted code tabs with copy and download functionality
- **Iterative Refinement**: Continuous chat-based component improvements
- **Statefulness**: Auto-save and resume functionality with full chat history

### Bonus Features (Optional)
- **Interactive Property Editor**: Click-to-edit component properties with live updates
- **Chat-Driven Overrides**: Target specific elements with natural language commands

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React UI      │    │ • Express API   │    │ • User Data     │
│ • State Mgmt    │    │ • JWT Auth      │    │ • Sessions      │
│ • Micro-Frontend│    │ • AI Integration│    │ • Chat History  │
│ • Code Editor   │    │ • Session Mgmt  │    │ • Components    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   AI Provider   │
                    │  (OpenRouter)   │
                    │                 │
                    │ • LLM Models    │
                    │ • Code Gen      │
                    └─────────────────┘
```

## Tech Stack

- **Frontend**: React + Next.js (SSR & routing)
- **Backend**: Node.js + Express
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT tokens
- **AI Integration**: OpenRouter API (GPT-4o-mini, Llama, etc.)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)

## Project Structure

```
component-generator-platform/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Next.js pages
│   │   ├── store/          # Zustand state management
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── config/             # Configuration files
│   └── package.json
├── docs/                   # Documentation
└── package.json           # Root package.json
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd component-generator-platform
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend (.env.local)
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local with your configuration
```

4. Start development servers:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Configuration

### Backend Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/component-generator
JWT_SECRET=your-jwt-secret
OPENROUTER_API_KEY=your-openrouter-api-key
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Session Endpoints
- `GET /api/sessions` - Get user sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get specific session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Chat Endpoints
- `POST /api/chat/generate` - Generate component from prompt
- `GET /api/sessions/:id/messages` - Get chat history
- `POST /api/sessions/:id/messages` - Add chat message

## Testing

```bash
# Run all tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test
```

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Configure build and start commands
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
