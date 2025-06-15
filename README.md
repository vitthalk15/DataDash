# Data Vista

A modern full-stack application for data visualization and management.

## Project Structure

```
.
├── client/          # React frontend
└── server/          # Node.js/Express backend
```

## Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/data-vista
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login user
- GET `/api/users/me` - Get current user profile
- GET `/api/users` - Get all users (admin only)

## Technologies Used

### Backend
- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

### Frontend (Coming Soon)
- React
- TypeScript
- Tailwind CSS
- React Query
- React Router 