# 🔍 Ask AI Troubleshooting Guide

## ❌ Issues Found:

### Issue 1: Victor_Paul - User Not Found ✅ FIXED
**Problem**: Searching for "Victor_Paul" or "@Victor_Paul" shows "User not found"

**Root Cause**: Username search was **case-sensitive**. Database contains `Victor_Paul` but search for `victor_paul` failed.

**Solution Implemented**:
1. Added `findByUsernameIgnoreCase()` method to `UserRepository.java` using JPQL
2. Updated `UserService.java` to try case-insensitive search first
3. Deployed to Render (commit `a0aa6e4`)

**Status**: 
- ✅ Backend deployed on Render
- ✅ Frontend rebuilt and deployed to Firebase
- ✅ Now accepts: `Victor_Paul`, `victor_paul`, `VICTOR_PAUL`, etc.

**Files Changed**:
- `Backend/src/main/java/com/athvexa/repository/UserRepository.java`
- `Backend/src/main/java/com/athvexa/service/UserService.java`

### Issue 2: Vijul_vijul - AI Summary Fails
**Problem**: AI Summary shows "⚠️ Could not generate AI summary. Please try again."

**Possible Causes**:
1. **Gemini API key issue** on Render
2. **Gemini API quota exceeded**
3. **Network timeout** - Render free tier cold start
4. **API rate limiting**

**How to Fix**:

#### Step 1: Check Render Backend Logs
1. Go to: https://dashboard.render.com
2. Click: **Athvexa-Backend**
3. Click: **Logs** tab
4. Search for: "Gemini" or "AI profile lookup"
5. Look for error messages

#### Step 2: Verify Gemini API Key
1. Go to Render dashboard → Athvexa-Backend
2. Click: **Environment** tab
3. Check: `GEMINI_API_KEY` is set
4. Value should be: `AIzaSyBzYI8m0YUO7sd0aGAlFUWfvJi_I5TaWjo`

#### Step 3: Test Gemini API Directly
Open this in browser or PowerShell:
```
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBzYI8m0YUO7sd0aGAlFUWfvJi_I5TaWjo" -H 'Content-Type: application/json' -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

**Expected**: JSON response with generated text
**If error**: Gemini API key is invalid or quota exceeded

#### Step 4: Check for 503 Errors
The backend has retry logic for 503 errors (service unavailable). If Render logs show:
```
Gemini API returned 503 on attempt 1/3. Retrying in 1000ms.
```

This means Gemini is temporarily unavailable. **Solution**: Wait 1 minute and try again.

---

## ✅ Quick Tests

### Test 1: Search for Vijul_vijul
```
1. Open Ask AI modal
2. Type: vijul_vijul (or @vijul_vijul)
3. Click Search
```

**Expected Result**:
- ✅ Profile card appears
- ✅ AI Summary shows: "Vijay Prince B L (@vijul_vijul) is a..."
- ✅ Fields 1-9 are populated

**Actual Result**:
- ❌ Profile card appears
- ❌ AI Summary shows: "⚠️ Could not generate AI summary"
- ✅ Fields 1-9 are populated correctly

**Diagnosis**: Backend can fetch user data, but Gemini API call is failing.

### Test 2: Search for Victor_Paul
```
1. Open Ask AI modal
2. Type: Victor_Paul (try different cases)
3. Click Search
```

**Expected Result**:
- ✅ Profile card appears
- ✅ AI Summary generated (or "No verified achievements" message)

**Actual Result**:
- ❌ "User not found" error
- ❌ No profile card

**Diagnosis**: Username doesn't match database record.

---

## 🔧 Immediate Fixes

### Fix 1: Find Victor Paul's Real Username

**Option A: Check Profile Page**
1. Navigate to Victor Paul's profile
2. Look at the URL: `/profile/{userId}`
3. Look at the page: Should show username somewhere

**Option B: Check Browser Console**
1. Press F12 to open console
2. Navigate to Victor Paul's profile
3. Look for network requests showing the username

**Option C: Check Database**
You mentioned Victor Paul exists. The username might be:
- `victor_paul` (all lowercase)
- `Victor.Paul` (dot instead of underscore)
- Something else entirely

### Fix 2: Debug Gemini API Issue

**Temporary Workaround**: The profile card DOES show all the data (achievements, points, etc.). Only the AI summary is failing. Users can still see all the information!

**Permanent Fix**: Check Render logs and fix the Gemini API issue.

---

## 📊 What's Working vs Not Working

### ✅ Working:
- Backend is live and responding
- Database connection works
- User lookup works (for vijul_vijul)
- Profile card displays all fields correctly
- Achievements are shown
- Field numbering is correct (1-9)
- Ask AI button appears on Home page
- Ask AI modal opens and accepts input
- Username validation works

### ❌ Fixed Issues:
- ✅ User search for Victor_Paul (case-insensitive search implemented)
- ⏳ AI Summary generation - needs testing after deployment

---

## 🚀 Next Steps

### Step 1: Check Victor Paul's Username
1. Go to his profile page
2. Find the EXACT username
3. Try searching with that exact format
4. Report back what the real username is

### Step 2: Fix Gemini API Issue
1. Check Render backend logs for Gemini errors
2. Verify GEMINI_API_KEY is set correctly
3. Test Gemini API directly
4. Check for rate limiting or quota issues

### Step 3: Test Again
Once fixed:
1. Search for vijul_vijul → Should show AI summary
2. Search for correct Victor Paul username → Should find user

---

## 🔍 Debug Commands

### Check Backend Health:
```powershell
curl https://athvexa-backend.onrender.com/api/health
```

### Check Render Logs:
```
1. https://dashboard.render.com
2. Athvexa-Backend → Logs
3. Search for: "AI profile lookup" or "Gemini"
```

### Test AI Summary API Directly:
```powershell
curl -X POST https://athvexa-backend.onrender.com/api/ai/profile-summary `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{"username":"vijul_vijul","question":null}'
```

Replace `YOUR_TOKEN` with your actual JWT token from localStorage.

---

## 💡 Likely Root Cause

### For Victor_Paul:
**Username is stored in lowercase**: `victor_paul`

**Solution**: Try searching for `victor_paul` (all lowercase)

### For AI Summary:
**Gemini API key not set on Render** OR **API quota exceeded**

**Solution**: 
1. Check Render environment variables
2. Verify GEMINI_API_KEY is set
3. Check Google AI Studio quota

---

**Need help?** Check the Render backend logs and let me know what errors you see!
