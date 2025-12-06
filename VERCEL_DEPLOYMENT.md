# Vercel Deployment Configuration

This document explains the Vercel configuration for the GlobalCare Support System frontend.

## Configuration File: `vercel.json`

The `vercel.json` file in the frontend folder contains all necessary configuration for deploying the React SPA to Vercel.

### Key Features

1. **Build Configuration**
   - Build command: `npm run build`
   - Output directory: `dist` (Vite default)
   - Framework: `vite`

2. **Route Handling (SPA)**
   - All routes are rewritten to `/index.html` to enable client-side routing
   - This allows React Router to handle all routes on the client side
   - Prevents 404 errors when accessing routes directly or refreshing the page

3. **Caching Headers**
   - Static assets (JS, CSS, images, fonts) are cached for 1 year
   - This improves performance and reduces bandwidth usage

4. **Security Headers**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin

## Routes Handled

The application uses React Router with the following route structure:

### Public Routes
- `/` - Home page
- `/why-us` - Why Us page
- `/plans` - Public plans page

### Customer Routes
- `/customer/login` - Customer login
- `/customer/signup` - Customer signup
- `/customer/dashboard` - Customer dashboard
- `/customer/plans` - Customer plans
- `/customer/payment/success` - Payment success page
- `/customer/chat/:chatId` - Customer chat interface

### Agent Routes
- `/agent/login` - Agent login
- `/agent/dashboard` - Agent dashboard
- `/agent/chat/:chatId` - Agent chat interface

### Admin Routes
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/services` - Services management
- `/admin/sub-services` - Sub-services management
- `/admin/plans` - Plans management
- `/admin/agents` - Agents management
- `/admin/transactions` - Transactions view
- `/admin/customers` - Customers management
- `/admin/chats` - Chats management

## Environment Variables

Make sure to set the following environment variables in Vercel:

- `VITE_API_URL` - Backend API URL (e.g., `https://your-api.com/api`)
- `VITE_SOCKET_URL` - Socket.io URL (optional, defaults to API URL)

## Deployment Steps

1. **Connect Repository to Vercel**
   - Go to Vercel dashboard
   - Import your Git repository
   - Select the `frontend` folder as the root directory

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Set Environment Variables**
   - Add `VITE_API_URL` with your backend API URL
   - Add `VITE_SOCKET_URL` if different from API URL

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

## How It Works

1. **Client-Side Routing**
   - When a user visits any route (e.g., `/customer/dashboard`), Vercel serves `index.html`
   - React Router then handles the routing on the client side
   - This prevents 404 errors when refreshing or directly accessing routes

2. **Static Asset Serving**
   - All static assets (JS, CSS, images) are served with long-term caching
   - This improves load times for returning visitors

3. **Security**
   - Security headers protect against common web vulnerabilities
   - Content Security Policy can be added if needed

## Troubleshooting

### 404 Errors on Routes
- Ensure `vercel.json` has the rewrite rule: `"source": "/(.*)", "destination": "/index.html"`
- Check that the build output includes `index.html` in the `dist` folder

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure Node.js version is compatible (check `package.json` engines if specified)
- Review build logs in Vercel dashboard

### API Connection Issues
- Verify `VITE_API_URL` environment variable is set correctly
- Check CORS settings on your backend API
- Ensure the API URL includes the protocol (https://)

### Socket Connection Issues
- Verify `VITE_SOCKET_URL` is set if different from API URL
- Check that your backend Socket.io server allows connections from Vercel domain

## Additional Notes

- The `vercel.json` file uses the newer Vercel configuration format
- All routes are handled by React Router, so no server-side routing is needed
- The configuration is optimized for a Single Page Application (SPA)
- Static assets are cached aggressively for better performance
