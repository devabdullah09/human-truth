# Vercel Postgres Setup Guide

## Step 1: Create Postgres Database

1. In your Vercel project dashboard, go to **Storage** tab
2. Under "Marketplace Database Providers", choose one:
   - **Neon** (Recommended - Serverless Postgres)
   - **Supabase** (Also good option)
3. Click **"Create"** on your chosen provider
4. Follow the setup wizard:
   - Name your database (e.g., "humantruth-db")
   - Choose a region close to you
   - Complete the setup

## Step 2: Get Connection String

After creating the database:

1. In your database provider's dashboard (Neon/Supabase)
2. Find the **Connection String** or **Connection URL**
3. It should look like:
   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```
4. Copy this entire string

## Step 3: Add Environment Variable in Vercel

1. Go back to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Add:
   - **Name**: `POSTGRES_URL`
   - **Value**: Paste your connection string
   - **Environments**: Select all (Production, Preview, Development)
5. Click **"Save"**

## Step 4: Run Database Migration

### Option A: Using Database Provider's SQL Editor (Easiest)

1. Go to your database provider's dashboard (Neon/Supabase)
2. Find the **SQL Editor** or **Query Editor**
3. Copy and paste the SQL from `drizzle/0000_initial.sql`:

```sql
CREATE TABLE IF NOT EXISTS "interviews" (
	"id" text PRIMARY KEY NOT NULL,
	"call_id" text NOT NULL,
	"participant_id" text,
	"transcript" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"duration" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interviews_call_id_unique" UNIQUE("call_id")
);
```

4. Click **"Run"** or **"Execute"**

### Option B: Using Drizzle Kit Locally

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

3. Run migration:
   ```bash
   npm run db:push
   ```

## Step 5: Redeploy Your Application

After adding the environment variable:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on your latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger a new deployment

## Step 6: Verify It Works

1. Visit your deployed app: `https://your-app.vercel.app`
2. Go to the dashboard: `https://your-app.vercel.app/dashboard`
3. It should load without errors (may show empty state if no interviews yet)

## Step 7: Update Retell AI Webhook

1. Copy your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Go to Retell AI dashboard
3. Update webhook URL to: `https://your-app.vercel.app/api/webhooks/retell`
4. Save the changes

## Troubleshooting

### Database Connection Error
- Verify `POSTGRES_URL` is correctly set in Vercel environment variables
- Check that the connection string includes SSL parameters if required
- Ensure you selected all environments (Production, Preview, Development)

### Migration Failed
- Check SQL syntax in the migration file
- Verify you have proper permissions in the database
- Try running the SQL directly in the database provider's SQL editor

### App Still Shows Errors
- Make sure you redeployed after adding environment variables
- Check Vercel function logs for specific error messages
- Verify the database table was created successfully

