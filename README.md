# Data Vista - Full Stack Dashboard

A modern full-stack dashboard application built with React, TypeScript, Node.js, Express, and MongoDB.

## 🚀 Quick Deployment Guide

This guide will help you deploy the backend on Render and frontend on Vercel.

## 📋 Prerequisites

- GitHub repository with your code
- MongoDB Atlas account (for database)
- Render account (for backend)
- Vercel account (for frontend)

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Set up database access (create username/password)
5. Set up network access (add `0.0.0.0/0` to allow all IPs)
6. Get your connection string

### Step 2: Get Connection String
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string
- Replace `<password>` with your actual password
- Example: `mongodb+srv://username:password@cluster.mongodb.net/data-vista?retryWrites=true&w=majority`

## 🔧 Backend Deployment on Render

### Step 1: Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select the repository

### Step 2: Configure Render Service
```
Name: data-vista-backend
Environment: Node
Region: Choose closest to your users
Branch: main
Build Command: npm install && npm run build
Start Command: node dist/server.js
```

### Step 3: Set Environment Variables in Render
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/data-vista?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app (update after frontend deploy)
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait for build to complete
- Note your backend URL: `https://your-app-name.onrender.com`

## 🌐 Frontend Deployment on Vercel

### Step 1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Select the repository

### Step 2: Configure Vercel Project
```
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Set Environment Variables in Vercel
```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

### Step 4: Deploy
- Click "Deploy"
- Wait for build to complete
- Note your frontend URL: `https://your-app-name.vercel.app`

## 🔗 Update Backend CORS

After getting your Vercel frontend URL:
1. Go back to Render Dashboard
2. Edit your web service
3. Update Environment Variables:
   ```
   FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
   ```
4. Redeploy the service

## 🛠️ Local Development

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 📁 Project Structure

```
├── client/                 # Frontend (React + TypeScript + Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── render.yaml            # Render deployment configuration
├── vercel.json            # Vercel deployment configuration
└── README.md
```

## 🔧 Environment Variables

### Backend (Render)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/data-vista?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

## 🚀 Deployment Commands Summary

### For Render (Backend):
1. Push code to GitHub
2. Create new Web Service on Render
3. Use `rootDir: server` configuration
4. Set environment variables
5. Deploy

### For Vercel (Frontend):
1. Push code to GitHub
2. Create new Project on Vercel
3. Set Root Directory to `client`
4. Set environment variables
5. Deploy

## 🔍 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in Render/Vercel
   - Ensure all dependencies are in package.json
   - Verify TypeScript compilation

2. **CORS Errors**
   - Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
   - Check for trailing slashes
   - Verify CORS configuration in server.ts

3. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has proper permissions

4. **Environment Variables**
   - Double-check all environment variables are set correctly
   - Ensure no typos in variable names
   - Verify variable names match the code

## 📱 Testing Your Deployment

1. **Test Backend API**
   - Visit: `https://your-render-backend-url.onrender.com`
   - Should see: `{"message":"Welcome to Data Vista API"}`

2. **Test Frontend**
   - Visit your Vercel URL
   - Try to register/login
   - Test all features

## 🔄 Continuous Deployment

Both Vercel and Render will automatically redeploy when you push to your main branch.

## 📞 Support

If you encounter issues:
1. Check the deployment logs in both platforms
2. Verify all environment variables are set correctly
3. Test locally first to isolate issues
4. Check the browser console for frontend errors
5. Check the server logs for backend errors

## 🎉 Success!

Once deployed, your application will be available at:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-app-name.onrender.com`

Both services will automatically update when you push changes to your GitHub repository. 
## ⚙️ Important Configuration Files


### render.yaml (for Render backend deployment)
```yaml
services:
  - type: web
    name: data-vista-backend
    env: node
    plan: free
    rootDir: server
    buildCommand: npm install && npm run build
    startCommand: node dist/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: FRONTEND_URL
        sync: false
```

