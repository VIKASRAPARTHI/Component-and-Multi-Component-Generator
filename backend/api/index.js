// Minimal serverless function for debugging
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

    res.status(200).json({
      success: true,
      message: 'Minimal backend is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasFrontendUrl: !!process.env.FRONTEND_URL
      }
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
