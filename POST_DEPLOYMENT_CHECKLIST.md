# Post-Deployment Checklist

## ✅ Completed
- [x] Vercel deployment successful
- [x] Neon database connected
- [x] Database migration run (interviews table created)
- [x] Environment variables set in Vercel

## 🔄 Next Steps

### 1. Verify Deployment
- [ ] Visit your app: `https://human-truth.vercel.app`
- [ ] Check dashboard loads: `https://human-truth.vercel.app/dashboard`
- [ ] Verify webhook endpoint: `https://human-truth.vercel.app/api/webhooks/retell`

### 2. Configure Retell AI
- [ ] Go to [Retell AI Dashboard](https://app.retellai.com)
- [ ] Open your agent settings
- [ ] Navigate to Webhooks section
- [ ] Set webhook URL to: `https://human-truth.vercel.app/api/webhooks/retell`
- [ ] Save changes

### 3. Test the Integration
- [ ] Place a test call using Retell AI
- [ ] Complete the interview
- [ ] Wait a few seconds for webhook to process
- [ ] Check dashboard for new interview

### 4. Verify Data Flow
- [ ] Dashboard shows interview count > 0
- [ ] Interview appears in "Recent Interviews"
- [ ] Question analytics display correctly
- [ ] Interview detail page shows transcript

### 5. Monitor Logs (if issues)
- [ ] Check Vercel function logs for webhook errors
- [ ] Verify database connection in Neon dashboard
- [ ] Check Retell AI webhook delivery status

## 🐛 Troubleshooting

### Webhook Not Receiving Data
1. Check Retell AI webhook URL is correct
2. Verify webhook endpoint is accessible
3. Check Vercel function logs for errors
4. Ensure Retell AI agent is configured correctly

### Dashboard Shows No Data
1. Verify webhook was received (check Vercel logs)
2. Check database table has data (Neon SQL Editor)
3. Verify environment variables are set correctly
4. Check for errors in browser console

### Database Connection Issues
1. Verify `POSTGRES_URL` in Vercel environment variables
2. Check Neon database is active
3. Verify connection string format
4. Check Vercel function logs for connection errors

## 📝 Useful URLs

- **Your App**: `https://human-truth.vercel.app`
- **Dashboard**: `https://human-truth.vercel.app/dashboard`
- **Webhook Endpoint**: `https://human-truth.vercel.app/api/webhooks/retell`
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Console**: https://console.neon.tech
- **Retell AI Dashboard**: https://app.retellai.com

## 🎉 Success Criteria

Your setup is complete when:
- ✅ Dashboard loads without errors
- ✅ Webhook endpoint responds
- ✅ Test call creates interview record
- ✅ Interview appears in dashboard
- ✅ Transcript displays correctly

