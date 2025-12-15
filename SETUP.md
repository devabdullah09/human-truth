# Quick Setup Guide

## Prerequisites Checklist

- [ ] Node.js 20+ installed
- [ ] npm or yarn installed
- [ ] Vercel account (for deployment)
- [ ] Retell AI account (free trial)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

**Option A: Vercel Postgres (Recommended)**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select existing
3. Go to Storage → Create Database → Postgres
4. Copy the `POSTGRES_URL` connection string

**Option B: Supabase**

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Project Settings → Database
4. Copy the connection string

### 3. Environment Variables

Create `.env.local` file:

```bash
# Copy from env.example
cp env.example .env.local
```

Edit `.env.local` and add your `POSTGRES_URL`.

### 4. Database Migration

Run the SQL migration manually:

1. Connect to your database (Vercel dashboard or Supabase SQL editor)
2. Run the SQL from `drizzle/0000_initial.sql`

Or use Drizzle Kit:

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 6. Retell AI Configuration

1. **Create Agent**:

   - Go to [Retell AI Dashboard](https://app.retellai.com)
   - Create new agent with prompt:
     ```
     You are conducting a 2-minute test interview. Filter for users who "are women" then ask the user: 'What's your favorite food and why?' Then thank them and end the call.
     ```

2. **Set Webhook URL**:

   - For local testing: Use ngrok

     ```bash
     ngrok http 3000
     ```

     Then set webhook to: `https://your-ngrok-url.ngrok.io/api/webhooks/retell`

   - For production: `https://your-app.vercel.app/api/webhooks/retell`

3. **Test the Webhook**:
   - Place a test call using Retell's web demo
   - Check your dashboard at `http://localhost:3000/dashboard`

## Testing Checklist

- [ ] Webhook endpoint responds: `GET /api/webhooks/retell`
- [ ] Dashboard loads: `http://localhost:3000/dashboard`
- [ ] Database connection works
- [ ] Test webhook receives data
- [ ] Interview appears in dashboard
- [ ] Interview detail page works

## Common Issues

### Database Connection Error

- Verify `POSTGRES_URL` is correct
- Check database is accessible
- Ensure migrations have run

### Webhook Not Receiving Data

- Verify webhook URL is correct
- Check Retell AI webhook settings
- Check server logs for errors
- Use ngrok for local testing

### Build Errors

- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version: `node --version` (should be 20+)

## Next Steps

1. Deploy to Vercel
2. Update Retell webhook URL
3. Place test calls
4. Review analytics on dashboard
