# 📊 DataDash

**DataDash** is a modern full-stack web application for intuitive **data visualization** and **management**. Built using the MERN stack with TypeScript, it features a clean UI, secure authentication, and scalable architecture.

---

## 📁 Project Structure

```
.
├── client/          # React frontend (port: 5173)
└── server/          # Node.js/Express backend (port: 4001)
```

---

## 🚀 Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file inside the `server` folder with the following environment variables:
   ```env
   PORT=4001
   MONGODB_URI=mongodb://localhost:27017/data-dash
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

> The backend will run at **http://localhost:4001**

---

## 🌐 Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

> The frontend will run at **http://localhost:5173**

---

## 🔐 API Endpoints

### Authentication
- `POST /api/users/register` — Register a new user  
- `POST /api/users/login` — Login and receive JWT  
- `GET /api/users/me` — Get logged-in user's profile  
- `GET /api/users` — Get all users (admin only)

---

## 🛠️ Technologies Used

### Backend
- **Node.js**
- **Express**
- **TypeScript**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **bcrypt** for secure password hashing

### Frontend
- **React**
- **TypeScript**
- **Tailwind CSS**
- **React Query**
- **React Router DOM**

---
