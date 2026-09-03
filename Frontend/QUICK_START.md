# ✨ Quick Start Guide - AI Summary Feature

## 🎯 CURRENT STATUS

✅ **Frontend**: Ready (Ask AI button visible on /home)
✅ **Backend**: Deployed on Render at https://athvexa-backend.onrender.com
✅ **.env file**: Created and configured

---

## 🚀 START THE FRONTEND

### Step 1: Stop the current frontend server (if running)
Press `Ctrl + C` in the terminal where `npm start` is running

### Step 2: Start the frontend again
```powershell
cd c:\Users\victo\.vscode\Athvexa\Frontend
npm start
```

This will:
- Load the `.env` file
- Configure frontend to use: `https://athvexa-backend.onrender.com`
- Start on: `http://localhost:3000`

---

## 🧪 TEST THE AI SUMMARY

### Step 1: Open the app
Go to: `http://localhost:3000`

### Step 2: Login or navigate to Home
- If you're on login page, login first
- Navigate to `/home`

### Step 3: Test Ask AI
1. You should see **"✨ Ask AI"** button in bottom-right corner (above bottom navbar)
2. Click the button
3. A modal should open: **"✨ Ask AI - Search any Athvexa user"**
4. Type a username, for example: `vijul_vijul` or `@vijul_vijul`
5. Click **🔍 Search** or press Enter

### Step 4: Verify it works
You should see:
- ⏳ Loading animation (shimmer skeleton)
- ✅ **AI Summary card** with:
  - Profile picture
  - Name and username
  - **AI-generated summary** from Gemini
  - Action buttons (View Profile, Share)

---

## ❌ IF IT STILL DOESN'T WORK

### Check 1: Verify .env is loaded
```powershell
cd c:\Users\victo\.vscode\Athvexa\Frontend
Get-Content .env
```
Should show: `REACT_APP_API_URL=https://athvexa-backend.onrender.com`

### Check 2: Verify backend is running
Open browser: https://athvexa-backend.onrender.com/api/health

Should show something like:
```json
{"status":"UP"}
```

### Check 3: Check browser console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "✨ Ask AI" and search
4. Look for errors

**Common errors:**
- `Network Error` → Backend is down on Render
- `404 Not Found` → API endpoint doesn't exist
- `CORS error` → Backend CORS configuration issue
- `500 Internal Server Error` → Backend database or Gemini API issue

### Check 4: Verify Render backend is awake
Render free tier may sleep after inactivity. First request might take 30-60 seconds to wake up.

Try opening: https://athvexa-backend.onrender.com/api/health
Wait for response, then test AI Summary again.

---

## 🔧 TROUBLESHOOTING

### Issue: "Could not generate AI summary"

**Possible causes:**
1. **Render backend is sleeping** → Wait 30 seconds and try again
2. **Backend database not connected** → Check Render environment variables
3. **Gemini API key invalid** → Check Render environment variables
4. **Username doesn't exist** → Try a different username

### Issue: Frontend still calls localhost:10000

**Solution:** Restart frontend server
```powershell
# Stop with Ctrl+C, then:
npm start
```

### Issue: Ask AI button not visible

**Solutions:**
1. Make sure you're on `/home` route
2. Refresh page (F5)
3. Clear browser cache (Ctrl+Shift+Delete)

---

## 📊 WHAT HAPPENS WHEN YOU CLICK "ASK AI"

1. **Frontend** (localhost:3000) → Opens modal
2. **User types username** → `vijul_vijul`
3. **Frontend sends request** → `POST https://athvexa-backend.onrender.com/api/ai/profile-summary`
4. **Backend** (Render) → Fetches user data from Supabase database
5. **Backend** → Sends data to Gemini AI API
6. **Gemini AI** → Generates summary
7. **Backend** → Returns summary to frontend
8. **Frontend** → Displays AI Summary card

---

## ✅ SUCCESS INDICATORS

When everything works:
- ✅ Ask AI button visible on /home
- ✅ Modal opens on click
- ✅ Search shows loading animation
- ✅ AI Summary appears with profile data
- ✅ Summary text is complete (not truncated)
- ✅ View Profile and Share buttons work

---

## 🎯 COMMANDS SUMMARY

### Start Frontend
```powershell
cd c:\Users\victo\.vscode\Athvexa\Frontend
npm start
```

### Check .env
```powershell
Get-Content c:\Users\victo\.vscode\Athvexa\Frontend\.env
```

### Test Backend Health
Open in browser: https://athvexa-backend.onrender.com/api/health

### Check Backend Logs (if issues)
Go to Render dashboard → Athvexa-Backend → Logs

---

## 🔥 QUICK FIX CHECKLIST

- [ ] Frontend restarted after creating .env
- [ ] On /home route (not /login or /chat)
- [ ] Backend URL in .env is https://athvexa-backend.onrender.com
- [ ] Backend is awake (visited health endpoint)
- [ ] Typed a valid username (try: vijul_vijul)
- [ ] Waited 30 seconds for first request (Render wakeup time)

---

**Now restart your frontend and test it!** 🚀
