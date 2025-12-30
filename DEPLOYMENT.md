# Deployment Guide - RxStream Analytics Platform

## Deploy to Vercel

### Prerequisites
- A [Vercel account](https://vercel.com/signup) (free tier available)
- Git repository (GitHub, GitLab, or Bitbucket)

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to your project directory:**
   ```bash
   cd "d:\Dashboard Analytics\sensor-dashboard"
   ```

3. **Login to Vercel:**
   ```bash
   vercel login
   ```

4. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts to link your project
   - Vercel will automatically detect the configuration from `vercel.json`

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Go to [Vercel Dashboard](https://vercel.com/new)**

3. **Import your repository:**
   - Click "Add New..." → "Project"
   - Select your Git provider and repository
   - Click "Import"

4. **Configure project settings:**
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/sensor-dashboard/browser`
   - **Install Command:** `npm install`

5. **Click "Deploy"**

### Build Configuration

The `vercel.json` file is already configured with:
- Build command: `npm run build`
- Output directory: `dist/sensor-dashboard/browser`
- SPA routing support (all routes redirect to index.html)

### Post-Deployment

After deployment, Vercel will provide you with:
- **Production URL:** `https://your-project-name.vercel.app`
- **Preview URLs:** For each git branch/commit
- **Automatic HTTPS:** SSL certificate included

### Environment Variables (if needed)

If you add any environment variables in the future:
1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add your variables for Production, Preview, and Development

### Custom Domain (Optional)

To add a custom domain:
1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Domains
3. Add your custom domain and follow DNS configuration instructions

### Continuous Deployment

Once connected to Git:
- **Every push to main branch** → Automatic production deployment
- **Every push to other branches** → Automatic preview deployment
- **Every pull request** → Automatic preview deployment with unique URL

## Troubleshooting

### Build Fails
- Ensure all dependencies are in `package.json`
- Check that Node.js version is compatible (Vercel uses Node 18+ by default)

### 404 Errors on Refresh
- The `vercel.json` rewrites configuration handles this
- Ensure the file is committed to your repository

### Large Bundle Size
- Angular is already configured with production optimizations
- Check bundle size warnings in build logs
- Consider lazy loading modules if needed

## Local Testing Before Deployment

Test the production build locally:
```bash
npm run build
npx http-server dist/sensor-dashboard/browser -p 8080
```

Visit `http://localhost:8080` to verify the production build works correctly.
