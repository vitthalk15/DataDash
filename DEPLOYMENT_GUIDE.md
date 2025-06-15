# 🚀 Deployment Guide: Frontend (Vercel) + Backend (Render)

## 📋 Prerequisites
- GitHub repository with your code
- MongoDB Atlas account (for database)
- Vercel account (for frontend)
- Render account (for backend)

## 🔧 Backend Deployment on Render

### Step 1: Deploy Backend to Render

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/Login with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure the Service**
   ```
   Name: data-vista-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main (or your default branch)
   Build Command: cd server && npm install && npm run build
   Start Command: cd server && npm start
   ```

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_here
   FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
   PORT=10000 (Render will set this automatically)
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Note the URL: `https://your-app-name.onrender.com`

## 🌐 Frontend Deployment on Vercel

### Step 1: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-render-backend-url.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note the URL: `https://your-app-name.vercel.app`

## 🔗 Update Backend CORS

After getting your Vercel frontend URL, update the backend environment variable:

1. **Go back to Render Dashboard**
2. **Edit your web service**
3. **Update Environment Variables**
   ```
   FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
   ```
4. **Redeploy the service**

## 🗄️ MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free account

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region
   - Create cluster

3. **Set Up Database Access**
   - Create database user
   - Set username and password

4. **Set Up Network Access**
   - Add IP: `0.0.0.0/0` (allow all IPs)

5. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

## 🔧 Environment Variables Summary

### Backend (Render) Environment Variables:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/data-vista?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
```

### Frontend (Vercel) Environment Variables:
```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

## 🚀 Deployment Commands

### Local Testing (Optional)
```bash
# Test backend locally
cd server
npm install
npm run build
npm start

# Test frontend locally
cd client
npm install
npm run dev
```

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
   - Check for trailing slashes

2. **Build Failures**
   - Check build logs in Render/Vercel
   - Ensure all dependencies are in package.json

3. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has proper permissions

4. **Environment Variables**
   - Double-check all environment variables are set correctly
   - Ensure no typos in variable names

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