# 🚀 Render Backend Setup - Fix AI Summary

## ❌ CURRENT ISSUE

The AI Summary shows: **"⚠️ Could not generate AI summary. Please try again."**

**Root Cause:** Your Render backend is missing the **GEMINI_API_KEY** environment variable.

---

## ✅ SOLUTION: Add Environment Variables to Render

### **Step 1: Go to Render Dashboard**

1. Open: https://dashboard.render.com
2. Click on your service: **Athvexa-Backend**
3. Click on **"Environment"** tab (you were just there!)

### **Step 2: Add These Environment Variables**

Click **"Add Environment Variable"** and add each of these:

#### Required Variables:

| Key | Value | Notes |
|-----|-------|-------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres?prepareThreshold=0` | Your Supabase pooler URL |
| `SPRING_DATASOURCE_USERNAME` | `postgres.wpamdnxkripvkiperlkl` | Your Supabase username |
| `SPRING_DATASOURCE_PASSWORD` | **[YOUR_SUPABASE_PASSWORD]** | Get from Supabase dashboard |
| `JWT_SECRET` | `24!@#$%^&*()_+SportsPlatformJWT` | Or your custom JWT secret |
| `CLOUDINARY_CLOUD_NAME` | `dxst75r0s` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `571284175968616` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `nlq-0bD7Ah76i_JuSaOxLuLT35c` | Your Cloudinary API secret |
| `GEMINI_API_KEY` | **[YOUR_GEMINI_API_KEY]** | ⚠️ THIS IS MISSING! |

---

## 🔑 HOW TO GET YOUR GEMINI API KEY

### Option 1: Check Your Local Script

Your Gemini API key is already in your local `run-local.ps1`:

<function_calls>
<invoke name="execute_pwsh">
<parameter name="command">Get-Content run-local.ps1 | Select-String "GEMINI_API_KEY"