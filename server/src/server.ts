import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import userRoutes from './routes/users';
import orderRoutes from './routes/orders';
import productRoutes from './routes/products';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Set default values for environment variables
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/data-vista';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
process.env.PORT = process.env.PORT || '4001';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Remove trailing slash for comparison
    const cleanOrigin = origin.replace(/\/$/, '');
    const cleanAllowedOrigin = allowedOrigin.replace(/\/$/, '');
    
    if (cleanOrigin === cleanAllowedOrigin) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin} (expected: ${allowedOrigin})`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Data Vista API' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/data-vista')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 4001, () => {
      console.log(`Server is running on port ${process.env.PORT || 4001}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 