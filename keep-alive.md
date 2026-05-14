# Keep Render Backend Alive (Free Solution)

## Problem
Render free tier spins down after 15 minutes of inactivity, causing 30-60 second cold starts.

## Solution: Use a Free Cron Job Service

### Option 1: UptimeRobot (Recommended)
1. Go to https://uptimerobot.com (Free account)
2. Click "Add New Monitor"
3. Monitor Type: HTTP(s)
4. Friendly Name: Athvexa Backend
5. URL: https://athvexa-backend.onrender.com/api/users/with-points
6. Monitoring Interval: 5 minutes (free tier)
7. Click "Create Monitor"

This will ping your backend every 5 minutes, keeping it warm!

### Option 2: Cron-Job.org
1. Go to https://cron-job.org (Free account)
2. Create new cron job
3. URL: https://athvexa-backend.onrender.com/api/users/with-points
4. Schedule: Every 10 minutes
5. Save

### Option 3: Create a Health Check Endpoint
Add this to your backend (already exists):
- Endpoint: /api/users/with-points
- This is a lightweight endpoint that just queries the database

## Result
- Backend stays warm 24/7
- Login time: 1-2 seconds instead of 60 seconds
- 100% FREE!

## Alternative: Upgrade Render
- Render Starter Plan: $7/month
- No cold starts
- Always-on backend
- Faster performance
