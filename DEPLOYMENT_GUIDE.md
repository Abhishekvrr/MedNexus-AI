# 🚀 MedNexus AI — Production Deployment Guide

This step-by-step guide is pre-configured for deploying MedNexus AI smoothly in less than 10 minutes.

---

## 🏗️ Architecture Overview

```mermaid
graph LR
    User[User / Doctor / Patient] -->|HTTPS| Vercel[Vercel Frontend - React/Vite]
    Vercel -->|REST API Calls| Render[Render / Railway Backend - Express.js]
    Render -->|Cloud Connection| Neon[Neon / Supabase - PostgreSQL Cloud DB]
    Render -->|AI Clinical Copilot| Groq[Groq AI Cloud - Llama 3 / Mixtral]
```

---

## 📋 Pre-Deployment Checklist

- [x] Frontend SPA routing configured (`frontend/vercel.json`)
- [x] Centralized API URL resolution (`frontend/src/config/api.js`)
- [x] Cloud PostgreSQL SSL connection support (`backend/src/config/database.js`)
- [x] CORS pre-configured for Vercel production domains (`backend/src/server.js`)
- [x] SQL Schema ready for 1-click cloud initialization (`backend/database/schema.sql`)
- [x] Test suites verified 100% operational

---

## 🛠️ Step 1: Deploy Free Cloud Database (1 Minute)

We recommend **[Neon.tech](https://neon.tech)** (free PostgreSQL serverless):

1. Go to [https://neon.tech](https://neon.tech) and sign up / log in with GitHub.
2. Click **Create Project** ➔ Name it `mednexus-ai`.
3. In the Neon Dashboard, click on **SQL Editor** in the left sidebar.
4. Copy the entire contents of [`backend/database/schema.sql`](backend/database/schema.sql) and paste it into the Neon SQL Editor, then click **Run**.
5. Go to **Dashboard** and copy your **Connection String** (`postgresql://...`).  
   *(Make sure `sslmode=require` is at the end of the URL)*.

---

## 🛠️ Step 2: Deploy Backend API (Render or Railway) (2 Minutes)

We recommend **[Render.com](https://render.com)** (free web service):

1. Go to [https://render.com](https://render.com) and click **New + ➔ Web Service**.
2. Select **Build and deploy from a Git repository** ➔ Connect your `MedNexus-AI` repo.
3. Configure the settings:
   - **Name:** `mednexus-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Under **Environment Variables**, add the following:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `PORT` | `5000` | Standard backend port |
   | `DATABASE_URL` | *Your Neon Connection String* | e.g., `postgresql://user:pass@ep-xyz.neon.tech/mednexus?sslmode=require` |
   | `JWT_SECRET` | `mednexus_super_secret_jwt_2026` | Any secure random string |
   | `GROQ_API_KEY` | *Your Groq API Key* | Starts with `gsk_...` |
   | `GROQ_MODEL` | `openai/gpt-oss-120b` | Or any active Groq model |
   | `FRONTEND_URL` | `*` *(or update with your Vercel URL in Step 3)* | Comma-separated allowed CORS origins |
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://mednexus-backend.onrender.com`).

---

## 🛠️ Step 3: Deploy Frontend on Vercel (2 Minutes)

1. Go to [https://vercel.com](https://vercel.com) and click **Add New... ➔ Project**.
2. Import your GitHub repository: **`Abhishekvrr/MedNexus-AI`**.
3. In the project setup screen:
   - **Root Directory:** Click *Edit* and select **`frontend`**.
   - **Framework Preset:** **`Vite`** (detected automatically).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://mednexus-backend.onrender.com` *(your Step 2 backend URL)* |
5. Click **Deploy**!
6. In ~45 seconds, your live production app will be active at `https://mednexus-ai.vercel.app` (or your assigned Vercel domain).

---

## 🔄 Step 4: Final CORS Sync (30 Seconds)

1. Copy your live Vercel URL (e.g., `https://mednexus-ai-xxx.vercel.app`).
2. Go back to Render / your backend host ➔ **Environment**.
3. Update `FRONTEND_URL`:
   ```env
   FRONTEND_URL=http://localhost:5173,https://your-vercel-domain.vercel.app
   ```
4. Save changes. Render will automatically redeploy in seconds.

---

## ✅ Post-Deployment Verification

To verify your live cloud deployment:
1. Visit `https://your-backend.onrender.com/api/health` ➔ should return `{"status": "operational", "database": {"connected": true}}`.
2. Open your Vercel URL in your browser.
3. Try registering a new Doctor and a new Patient, book an appointment, and test the AI Clinical Copilot.

🎉 **Your MedNexus AI Healthcare Platform is live globally!**
