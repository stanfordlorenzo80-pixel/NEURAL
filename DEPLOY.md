# NeuralTrade - Deployment Guide

## Quick Deploy (Recommended)

### Step 1: Deploy Frontend to Vercel (Free)
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Push your code to a GitHub repository
3. Click "New Project" → import your repo
4. Vercel auto-detects Vite — click "Deploy"
5. Your site will be live at `https://your-app.vercel.app`

### Step 2: Deploy Backend to Railway (Free Tier)
1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub Repo"
3. Point it to the `server/` directory
4. Add environment variables:
   - `ALPACA_API_KEY` = your key
   - `ALPACA_SECRET_KEY` = your secret
   - `ALPACA_PAPER` = true
   - `STRIPE_SECRET_KEY` = your stripe key
   - `FRONTEND_URL` = https://your-app.vercel.app
   - `PORT` = 3001
5. Railway will give you a URL like `https://neuraltrade-api.up.railway.app`

### Step 3: Update Frontend API URL
After deploying backend, update `VITE_API_URL` in Vercel environment variables to point to your Railway URL.

### Step 4: Give Stripe Your URL
Once deployed, use your Vercel URL (e.g. `https://neuraltrade.vercel.app`) as your business website in Stripe.

## Alternative: Deploy Everything to Railway
You can also deploy both frontend and backend as a single app on Railway if you prefer.
