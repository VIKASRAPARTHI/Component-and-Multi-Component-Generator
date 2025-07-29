# Frontend Environment Setup

## Local Development

### 1. Environment File Setup
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your values
```

### 2. Required Environment Variables

#### `.env.local` (for local development):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Component Generator Platform
```

## Production Deployment (Vercel)

### 1. Environment Variables in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables and add:

```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_APP_NAME=Component Generator Platform
```

### 2. How to Get Backend URL

1. Deploy your backend first on Vercel
2. Note the backend URL (e.g., `https://ai-component-backend.vercel.app`)
3. Use this URL for `NEXT_PUBLIC_API_URL`

### 3. Example Production Values

```env
NEXT_PUBLIC_API_URL=https://ai-component-backend.vercel.app
NEXT_PUBLIC_APP_URL=https://ai-component-frontend.vercel.app
NEXT_PUBLIC_APP_NAME=Component Generator Platform
```

## Environment Variable Usage

### In Code:
```javascript
// API calls will use this base URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// App configuration
const appName = process.env.NEXT_PUBLIC_APP_NAME;
```

### Important Notes:
- All frontend environment variables must start with `NEXT_PUBLIC_`
- Variables are embedded at build time
- Changes require rebuild/redeploy
- Never put sensitive data in frontend environment variables

## Troubleshooting

### API Connection Issues:
1. Check `NEXT_PUBLIC_API_URL` is correct
2. Ensure backend is deployed and accessible
3. Test backend health: `https://your-backend.vercel.app/health`
4. Check browser network tab for API call errors

### Environment Variable Not Working:
1. Ensure variable starts with `NEXT_PUBLIC_`
2. Restart development server after changes
3. Check Vercel dashboard for production variables
4. Verify no typos in variable names
