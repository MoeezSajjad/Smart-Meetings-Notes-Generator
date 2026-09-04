// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString()
  });
};

// Request validation middleware
export const validateRequest = (req, res, next) => {
  // Add request validation logic here
  next();
};

// JWT Authentication middleware
export const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Missing authorization token',
        status: 401,
        timestamp: new Date().toISOString()
      });
    }
    
    // Expected format: "Bearer <token>"
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Invalid authorization header format. Expected: Bearer <token>',
        status: 401,
        timestamp: new Date().toISOString()
      });
    }
    
    const token = tokenParts[1];
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        error: 'Server configuration error',
        status: 500,
        timestamp: new Date().toISOString()
      });
    }
    
    // For JWT tokens using jsonwebtoken library:
    // Uncomment the following if you install jsonwebtoken:
    // import jwt from 'jsonwebtoken';
    // const decoded = jwt.verify(token, jwtSecret);
    // req.user = decoded;
    
    // For Supabase JWT (which are also valid JWT tokens):
    // You can use the same jwt.verify approach with your Supabase secret
    // const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    
    // For Firebase tokens:
    // import admin from 'firebase-admin';
    // const decoded = await admin.auth().verifyIdToken(token);
    // req.user = { uid: decoded.uid, email: decoded.email };
    
    // Placeholder: Manual token validation (basic verification)
    // This is a simple example - in production, use jwt.verify()
    if (!token || token.length < 10) {
      return res.status(401).json({
        error: 'Invalid token',
        status: 401,
        timestamp: new Date().toISOString()
      });
    }
    
    // Attach a placeholder user object to the request
    // In production, this would come from jwt.verify() or Firebase/Supabase
    req.user = {
      token: token,
      // When you implement real token validation, this will contain:
      // id, email, iat (issued at), exp (expiration), etc.
      authenticated: true
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired token',
      status: 401,
      timestamp: new Date().toISOString()
    });
  }
};

// Logging middleware
export const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};
