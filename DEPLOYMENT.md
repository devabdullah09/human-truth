# Deployment Guide

## Option 1: Deploy Using Vercel CLI (No GitHub Required) ⭐ RECOMMENDED

This is the easiest way to deploy without pushing to GitHub first.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

### Step 3: Deploy from Your Project Directory

```bash
cd D:\Work\HumanTruth
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account/team
- **Link to existing project?** → No (for first deployment)
- **What's your project's name?** → humantruth-interview-platform (or any name)
- **In which directory is your code located?** → `./` (current directory)
- **Want to override the settings?** → No

### Step 4: Add Environment Variables

After deployment, add your environment variables:

```bash
vercel env add POSTGRES_URL
# Paste your database connection string when prompted
# Select: Production, Preview, and Development

vercel env add RETELL_WEBHOOK_SECRET
# Optional: Add webhook secret if you have it
# Select: Production, Preview, and Development
```

Or add them via Vercel Dashboard:
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add `POSTGRES_URL` and `RETELL_WEBHOOK_SECRET` (optional)

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

### Step 6: Set Up Database

1. Go to Vercel Dashboard → Your Project → Storage
2. Create a Postgres database
3. Copy the `POSTGRES_URL`
4. Run the migration SQL from `drizzle/0000_initial.sql` in the database

Or use Drizzle Kit:

```bash
vercel env pull .env.local
npm run db:push
```

### Step 7: Update Retell AI Webhook URL

1. Copy your deployment URL from Vercel (e.g., `https://your-app.vercel.app`)
2. Go to Retell AI dashboard
3. Update webhook URL to: `https://your-app.vercel.app/api/webhooks/retell`

---

## Option 2: Deploy via GitHub (Traditional Method)

If you prefer using GitHub:

### Step 1: Initialize Git Repository

```bash
cd D:\Work\HumanTruth
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (don't initialize with README)
3. Copy the repository URL

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 4: Import in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Environment Variables: Add `POSTGRES_URL`
5. Click "Deploy"

---

## Quick Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Open project in browser
vercel open

# Pull environment variables
vercel env pull .env.local
```

---

## Troubleshooting

### "Invalid repository URL" Error
- Use Option 1 (Vercel CLI) instead
- Or push to GitHub first (Option 2)

### Environment Variables Not Working
- Make sure you added them for all environments (Production, Preview, Development)
- Redeploy after adding: `vercel --prod`

### Database Connection Issues
- Verify `POSTGRES_URL` is correct
- Check database is accessible
- Run migrations: `npm run db:push`

### Build Errors
- Check Node.js version (should be 20+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

