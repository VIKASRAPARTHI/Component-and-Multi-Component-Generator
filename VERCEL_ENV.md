# Vercel Environment Variables

## Required Environment Variables for Vercel Deployment

Add these environment variables in your Vercel dashboard:

### Backend Environment Variables

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/component-generator
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
JWT_EXPIRE=7d
OPENROUTER_API_KEY=your-openrouter-api-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=https://your-vercel-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

```
NEXT_PUBLIC_API_URL=/api
NODE_ENV=production
```

## Setup Instructions

1. **MongoDB Atlas Setup:**
   - Create account at https://cloud.mongodb.com
   - Create cluster and get connection string
   - Replace username, password, and cluster URL in MONGODB_URI

2. **OpenRouter API Key:**
   - Sign up at https://openrouter.ai
   - Get API key from dashboard
   - Add to OPENROUTER_API_KEY

3. **Google Gemini API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Create API key
   - Add to GEMINI_API_KEY

4. **JWT Secret:**
   - Generate a secure random string (minimum 32 characters)
   - Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Vercel Deployment Steps

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

## Demo User
After deployment, create a demo user:
- Email: demo@example.com
- Password: demo123
