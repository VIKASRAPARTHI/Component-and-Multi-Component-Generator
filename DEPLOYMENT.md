# AI Component Generator Platform - Deployment Guide

## Production Deployment

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- OpenRouter API Key
- Google Gemini API Key

### Backend Deployment

1. **Environment Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Install Dependencies:**
   ```bash
   npm install --production
   ```

3. **Start Production Server:**
   ```bash
   npm start
   ```

### Frontend Deployment

1. **Environment Setup:**
   ```bash
   cd frontend
   # Update API_BASE_URL in src/utils/api.js for production
   ```

2. **Build for Production:**
   ```bash
   npm install
   npm run build
   ```

3. **Start Production Server:**
   ```bash
   npm start
   ```

### Environment Variables

#### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `OPENROUTER_API_KEY` - OpenRouter API key
- `GEMINI_API_KEY` - Google Gemini API key
- `FRONTEND_URL` - Frontend URL for CORS

#### Frontend
- Update `API_BASE_URL` in `src/utils/api.js`

### Production Checklist
- [ ] MongoDB database configured
- [ ] API keys configured
- [ ] CORS settings updated
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Monitoring setup

### Demo Credentials
- Email: demo@example.com
- Password: demo123

## Development

### Local Development
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

### Features
- AI-powered component generation
- Multiple AI models (GPT-4, Claude, Gemini)
- Live component preview
- Code export and download
- Session management
- User authentication
