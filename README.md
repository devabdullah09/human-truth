# Voice Interview Platform

A mini voice interview platform that receives webhook notifications from Retell AI, validates and stores interview data securely, and displays interview analytics on a dashboard.

## Features

### Core Features

1. **Webhook Receiver** (`/api/webhooks/retell`)
   - Accepts POST requests from Retell AI
   - Validates webhook signature (mock validation for development)
   - Extracts interview data from payload
   - Stores data in database
   - Returns appropriate status codes

2. **Database Schema**
   - Call ID (unique identifier)
   - Participant ID
   - Transcript (array of messages)
   - Interview duration
   - Completion status
   - Timestamp

3. **Analytics Dashboard** (`/dashboard`)
   - Overview metrics:
     - Total interviews completed
     - Average interview duration
     - Completion rate
   - Question-by-question analytics:
     - List each question asked across all interviews
     - Show number of responses per question
     - Display recent answers for each question
     - Average response length per question

4. **Interview Detail Page** (`/interview/[callId]`)
   - Display complete transcript
   - Show interview metadata
   - Format conversation clearly (agent vs user)

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Database**: Vercel Postgres (free tier)
- **ORM**: Drizzle ORM
- **UI Components**: shadcn/ui (card, button, badge, scroll-area)
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript strict mode
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Vercel account (for deployment)
- Retell AI account (free trial)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd HumanTruth
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example env file (or create .env.local manually)
cp env.example .env.local
# Or on Windows: copy env.example .env.local
```

4. Configure your `.env.local` file with the required variables (see `.env.example`)

5. Set up the database:
   - Create a Vercel Postgres database in your Vercel dashboard
   - Copy the `POSTGRES_URL` from Vercel and add it to `.env.local`
   - Run database migrations:
   ```bash
   npm run db:push
   ```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Retell AI Setup

### 1. Create Retell AI Account

1. Sign up at [https://app.retellai.com](https://app.retellai.com) (free trial, no credit card required)

### 2. Create an AI Agent

1. Navigate to "Agents" in the Retell AI dashboard
2. Create a new AI agent with the following prompt:
   ```
   You are conducting a 2-minute test interview. Filter for users who "are women" then ask the user: 'What's your favorite food and why?' Then thank them and end the call.
   ```

### 3. Configure Webhook URL

1. In your Retell AI agent settings, find the "Webhooks" section
2. Set the webhook URL to:
   - **Development**: Use ngrok or similar tool to expose your local server:
     ```
     ngrok http 3000
     ```
     Then use: `https://your-ngrok-url.ngrok.io/api/webhooks/retell`
   
   - **Production**: Use your Vercel deployment URL:
     ```
     https://your-app.vercel.app/api/webhooks/retell
     ```

3. Copy your Retell AI API key (you'll need it for making test calls)

### 4. Trigger Test Calls

1. Use Retell's web demo to place test calls
2. Or use their API to trigger calls programmatically
3. After each call completes, the webhook will be triggered automatically

## Environment Variables

See `.env.example` for all required environment variables:

- `POSTGRES_URL`: Your Vercel Postgres connection string
- `RETELL_WEBHOOK_SECRET`: (Optional) Webhook secret for signature validation in production
- `NODE_ENV`: Set to `production` for production deployments

## Deployment to Vercel

1. Push your code to GitHub

2. Import your project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. Configure environment variables:
   - Add `POSTGRES_URL` from your Vercel Postgres database
   - Add any other required environment variables

4. Deploy:
   - Vercel will automatically detect Next.js and deploy
   - After deployment, update your Retell AI webhook URL to point to your Vercel URL

5. Run database migrations:
   ```bash
   npm run db:push
   ```
   Or use Vercel's CLI:
   ```bash
   vercel env pull .env.local
   npm run db:push
   ```

## Project Structure

```
.
├── app/
│   ├── api/
│   │   └── webhooks/
│   │       └── retell/
│   │           └── route.ts          # Webhook receiver endpoint
│   ├── dashboard/
│   │   └── page.tsx                  # Analytics dashboard
│   ├── interview/
│   │   └── [callId]/
│   │       └── page.tsx              # Interview detail page
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   └── globals.css                   # Global styles
├── components/
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── db/
│   │   ├── index.ts                  # Database connection
│   │   ├── schema.ts                 # Database schema
│   │   └── queries.ts                # Database queries
│   ├── validations/
│   │   └── webhook.ts                # Zod schemas
│   └── utils.ts                      # Utility functions
├── drizzle.config.ts                 # Drizzle configuration
└── package.json
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database commands
npm run db:generate    # Generate migrations
npm run db:push        # Push schema to database
npm run db:studio      # Open Drizzle Studio
```

## Testing the Webhook

You can test the webhook endpoint locally using curl or a tool like Postman:

```bash
curl -X POST http://localhost:3000/api/webhooks/retell \
  -H "Content-Type: application/json" \
  -H "x-retell-signature: mock-signature" \
  -d '{
    "event": "call_ended",
    "call": {
      "call_id": "test-call-123",
      "agent_id": "test-agent"
    },
    "transcript": [
      {
        "role": "agent",
        "content": "What is your favorite food?",
        "timestamp": 1234567890
      },
      {
        "role": "user",
        "content": "I love pizza because it is delicious.",
        "timestamp": 1234567900
      }
    ],
    "call_duration": 120,
    "end_reason": "completed"
  }'
```

## Support

For issues or questions, please refer to:
- Retell AI Documentation: [https://docs.retellai.com](https://docs.retellai.com)
- Next.js Documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
- Drizzle ORM Documentation: [https://orm.drizzle.team](https://orm.drizzle.team)
