# Data Vista Client

This is the frontend application for Data Vista, built with React, TypeScript, and Tailwind CSS.

## Features

- User authentication (login, register, logout)
- Protected routes
- Responsive layout with sidebar navigation
- Dashboard with statistics and recent activity
- User management
- Profile settings

## Prerequisites

- Node.js 18 or later
- npm or yarn

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production bundle
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build locally

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── contexts/       # React contexts
  ├── hooks/         # Custom hooks
  ├── lib/           # Utility functions and configurations
  ├── pages/         # Page components
  ├── types/         # TypeScript type definitions
  ├── App.tsx        # Main application component
  └── main.tsx       # Application entry point
```

## Technologies Used

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- ESLint 