# Separate Frontend and Backend Deployment on Vercel

## Deployment Strategy

Deploy frontend and backend as separate Vercel projects for better separation of concerns.

## Step 1: Deploy Backend

### 1.1 Create Backend Repository
```bash
# Option A: Create separate repository for backend
git subtree push --prefix=backend origin backend-main

# Option B: Use same repository with different root directory
```

### 1.2 Deploy Backend on Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your repository
4. **Set Root Directory to `backend`**
5. Framework Preset: Other
6. Build Command: `npm install`
7. Output Directory: (leave empty)
8. Install Command: `npm install`

### 1.3 Backend Environment Variables
Add these in Vercel dashboard:
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/component-generator
JWT_SECRET=your-32-character-secret
JWT_EXPIRE=7d
OPENROUTER_API_KEY=your-openrouter-key
GEMINI_API_KEY=your-gemini-key
FRONTEND_URL=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 1.4 Note Backend URL
After deployment, note your backend URL:
`https://your-backend-app.vercel.app`

## Step 2: Deploy Frontend

### 2.1 Deploy Frontend on Vercel
1. Go to https://vercel.com
2. Click "New Project" 
3. Import your repository (same or different)
4. **Set Root Directory to `frontend`**
5. Framework Preset: Next.js
6. Build Command: `npm run build`
7. Output Directory: `.next`
8. Install Command: `npm install`

### 2.2 Frontend Environment Variables
Add these in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend-app.vercel.app
```

## Step 3: Update CORS

After both deployments, update backend CORS settings:

### 3.1 Update Backend CORS
In `backend/src/server.js`, update CORS origins:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app'
  ],
  credentials: false
};
```

## Step 4: Test Deployment

### 4.1 Test Backend
Visit: `https://your-backend-app.vercel.app/health`
Should return: `{"status":"OK"}`

### 4.2 Test Frontend
Visit: `https://your-frontend.vercel.app`
- Should load landing page
- Login/Register should work
- Component generation should work

## Architecture

```
Frontend (Vercel)          Backend (Vercel)
├── Next.js App            ├── Express.js API
├── Static Assets          ├── MongoDB Connection
├── React Components       ├── AI Services
└── API Calls ──────────→  └── Authentication
```

## Benefits

✅ **Independent Scaling** - Scale frontend and backend separately
✅ **Independent Deployments** - Deploy updates independently  
✅ **Better Performance** - Frontend on CDN, backend optimized for APIs
✅ **Easier Debugging** - Separate logs and monitoring
✅ **Team Collaboration** - Different teams can work on different parts

## URLs After Deployment

- **Frontend**: `https://your-frontend.vercel.app`
- **Backend**: `https://your-backend.vercel.app`
- **API Endpoints**: `https://your-backend.vercel.app/api/*`

## Troubleshooting

### CORS Errors
- Update backend CORS origins
- Ensure frontend URL is whitelisted

### API Connection Errors  
- Verify NEXT_PUBLIC_API_URL is correct
- Check backend deployment status
- Test backend health endpoint

### Environment Variables
- Ensure all required variables are set
- Check variable names match exactly
- Verify MongoDB connection string
