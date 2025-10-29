import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import notificationRoutes from './routes/notification.js';
import statisticsRoutes from './routes/statistics.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3000;

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.removeHeader('X-Powered-By');
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 1000, // 1000 requests for both dev and production
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limit for health checks and specific routes
    if (req.path === '/health' || req.path.startsWith('/api/upload')) {
      return true;
    }
    return process.env.NODE_ENV !== 'production';
  }
});

// Apply rate limiter to all routes
app.use(limiter);

// CORS configuration - Manual middleware to ensure correct origin is set
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3001',
  'https://mycoderoar.vercel.app',
  'https://blog-api-tau-sand.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];

// CORS middleware - MUST be before routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  const isVercelApp = origin && origin.includes('vercel.app');
  const isLocalhost = origin && origin.startsWith('http://localhost');
  const isAllowed = origin && (allowedOrigins.includes(origin) || isVercelApp || isLocalhost);
  
  if (origin && isAllowed) {
    // Set the EXACT origin from the request, not a hardcoded value
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-request-id, x-requested-with, accept, origin, access-control-request-method, access-control-request-headers, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, Cache-Control, Pragma');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Handle both JSON (base64) and multipart (form) uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Preflight requests are handled by the cors package above

// Special handling for upload routes to support both base64 and multipart
app.use('/api/upload', (req, res, next) => {
  // If it's a JSON request with base64 data, don't parse as multipart
  if (req.headers['content-type']?.includes('application/json')) {
    return next();
  }
  // Otherwise, let it be handled by formidable in the controller
  next();
});

// Increase timeout for file uploads
app.use((req, res, next) => {
  // Set timeout to 5 minutes for upload routes
  if (req.path.includes('/upload')) {
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000); // 5 minutes
  }
  next();
});
app.use('/api', routes);
app.use('/api/notifications', notificationRoutes);

// Add direct routes without /api prefix for frontend compatibility
app.use('/statistics', statisticsRoutes);
app.use('/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Don't exit the process - just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Don't exit the process - just log the error
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});