# Vercel Full-Stack Deployment Guide

## Quick Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy on Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration

### 3. Add Environment Variables
In Vercel dashboard, go to Project Settings → Environment Variables and add:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/component-generator
JWT_SECRET=your-32-character-secret-key
JWT_EXPIRE=7d
OPENROUTER_API_KEY=your-openrouter-api-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=https://your-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## Architecture on Vercel

```
your-app.vercel.app
├── Frontend (Next.js) - Static + SSR
├── /api/* - Backend API (Serverless Functions)
└── Database (MongoDB Atlas)
```

## Testing Deployment

### 1. Health Check
Visit: `https://your-app.vercel.app/api/health`
Should return: `{"status":"OK"}`

### 2. Full Test
1. Visit your Vercel URL
2. Register/login with demo credentials
3. Create a session
4. Generate a component
5. Verify live preview works

## Demo Credentials
- Email: demo@example.com
- Password: demo123

## Troubleshooting

### Build Errors
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure MongoDB URI is correct

### API Errors
- Check function logs in Vercel dashboard
- Verify API routes are working: `/api/health`
- Check CORS configuration

### Database Issues
- Verify MongoDB Atlas connection
- Check IP whitelist (allow 0.0.0.0/0 for Vercel)
- Test connection string

## Benefits of Vercel Deployment

✅ **Zero Configuration** - Auto-detects Next.js and Node.js
✅ **Global CDN** - Fast worldwide performance
✅ **Automatic HTTPS** - SSL certificates included
✅ **Serverless Functions** - Backend scales automatically
✅ **Git Integration** - Auto-deploy on push
✅ **Custom Domains** - Easy domain setup
✅ **Analytics** - Built-in performance monitoring

Your AI Component Generator Platform will be live at:
`https://your-app-name.vercel.app`
