// Simple backend with basic auth endpoints
module.exports = (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const { url, method } = req;

    // Parse request body for POST requests
    let body = {};
    if (method === 'POST' && req.body) {
      body = req.body;
    }

    // Route handling
    if (url === '/health') {
      return res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        env: {
          NODE_ENV: process.env.NODE_ENV,
          hasMongoUri: !!process.env.MONGODB_URI,
          hasJwtSecret: !!process.env.JWT_SECRET
        }
      });
    }

    if (url === '/api/auth/login' && method === 'POST') {
      // Simple mock login
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: '1',
            name: body.email?.split('@')[0] || 'User',
            email: body.email || 'user@example.com',
            avatar: null,
            preferences: {},
            createdAt: new Date().toISOString()
          },
          token: 'mock-jwt-token-' + Date.now()
        }
      });
    }

    if (url === '/api/auth/register' && method === 'POST') {
      // Simple mock register
      return res.status(201).json({
        success: true,
        data: {
          user: {
            id: '1',
            name: body.name || 'New User',
            email: body.email || 'user@example.com',
            avatar: null,
            preferences: {},
            createdAt: new Date().toISOString()
          },
          token: 'mock-jwt-token-' + Date.now()
        }
      });
    }

    if (url === '/api/sessions' && method === 'GET') {
      // Mock sessions list
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    if (url === '/api/sessions' && method === 'POST') {
      // Mock session creation
      return res.status(201).json({
        success: true,
        data: {
          id: 'session-' + Date.now(),
          title: body.title || 'New Session',
          description: body.description || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            totalMessages: 0,
            lastActivity: new Date().toISOString()
          }
        }
      });
    }

    // Default response
    res.status(200).json({
      success: true,
      message: 'Simple backend is working!',
      timestamp: new Date().toISOString(),
      method,
      url,
      body
    });
  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
