# Vercel Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Prerequisites Setup

#### MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Create free account and cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/component-generator`
4. Whitelist all IPs (0.0.0.0/0) for Vercel

#### API Keys
1. **OpenRouter**: https://openrouter.ai → Get API key
2. **Gemini**: https://makersuite.google.com/app/apikey → Create API key
3. **JWT Secret**: Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### Required Environment Variables
Add these in Vercel dashboard (Project Settings → Environment Variables):

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/component-generator
JWT_SECRET=your-generated-jwt-secret
JWT_EXPIRE=7d
OPENROUTER_API_KEY=your-openrouter-key
GEMINI_API_KEY=your-gemini-key
FRONTEND_URL=https://your-app-name.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NEXT_PUBLIC_API_URL=/api
```

### 2. GitHub Setup

```bash
# Push to GitHub
git remote add origin https://github.com/yourusername/ai-component-generator.git
git push -u origin master
```

### 3. Vercel Deployment

1. **Connect to Vercel:**
   - Go to https://vercel.com
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings:**
   - Framework Preset: Next.js
   - Root Directory: `./` (leave empty)
   - Build Command: `npm run build`
   - Output Directory: `frontend/.next`

3. **Add Environment Variables:**
   Go to Project Settings → Environment Variables and add all variables from step 1 above.

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app-name.vercel.app`

### 4. Post-Deployment Setup

#### Create Demo User
After deployment, create a demo user by running this in your browser console on the registration page:

```javascript
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo123'
  })
});
```

### 5. Testing Deployment

1. **Frontend Test:**
   - Visit your Vercel URL
   - Should see landing page with blue/black gradient

2. **Backend Test:**
   - Visit `https://your-app.vercel.app/api/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

3. **Full Flow Test:**
   - Register new account
   - Login with demo credentials
   - Create new session
   - Generate a component
   - Verify live preview works

### 6. Troubleshooting

#### Common Issues:

1. **API Routes 404:**
   - Check vercel.json routing configuration
   - Verify backend/api/index.js exists

2. **Database Connection:**
   - Verify MongoDB URI is correct
   - Check IP whitelist in MongoDB Atlas

3. **Environment Variables:**
   - Ensure all required vars are set in Vercel dashboard
   - Check variable names match exactly

4. **Build Failures:**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are in package.json

### 7. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Update FRONTEND_URL environment variable

## Architecture on Vercel

```
Vercel Edge Network
├── Frontend (Next.js) - Static + SSR
├── API Routes (/api/*) - Serverless Functions
└── Backend (Express.js) - Serverless Function
```

Your AI Component Generator Platform is now live on Vercel!
