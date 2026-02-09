# FridgeChef Deployment Guide

## 🚀 Quick Deploy to Vercel + Render (Free Tier - Recommended)

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Render account (sign up at render.com)

---

## Step 1: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `rithwik1510/FridgeChef`
4. Configure the service:
   - **Name:** `fridgechef-api`
   - **Region:** Choose closest to you (Oregon/Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** **Free**

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   SECRET_KEY = d7aa4b6e66e05dc507330b7ee13ca349f75b9504da5b3574930b75ff3470b527
   GOOGLE_API_KEY = your_google_api_key_here
   ALLOWED_ORIGINS = https://fridgechef.vercel.app
   DATABASE_URL = postgresql://postgres:YOUR_URL_ENCODED_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
   ```

6. Click **"Create Web Service"**
7. Wait 5-10 minutes for first deployment
8. **Copy your backend URL** (e.g., `https://fridgechef-api.onrender.com`)

---

## Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your repository: `rithwik1510/FridgeChef`
4. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)

5. **Add Environment Variable**:
   - Click "Environment Variables"
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://fridgechef-api.onrender.com/api/v1` (use your Render URL)

6. Click **"Deploy"**
7. Wait 3-5 minutes
8. **Your app is live!** Copy the URL (e.g., `https://fridgechef.vercel.app`)

---

## Step 3: Update Backend CORS

1. Go back to Render dashboard → Your service
2. Click **"Environment"** in left sidebar
3. Find `ALLOWED_ORIGINS` and click "Edit"
4. Update to your Vercel URL:
   ```
   https://fridgechef-vercel-app-name.vercel.app
   ```
5. Click "Save Changes" (auto-redeploys)

---

## Step 4: Test Deployment

Visit your Vercel URL and test:
- ✅ App loads
- ✅ Sign up/login works
- ✅ Image upload works
- ✅ Recipe generation works

---

## ⚠️ Free Tier Limitations

### Render Free Tier
- **Cold starts:** Spins down after 15 min inactivity
- First request takes 30-60 seconds to wake up
- Good for testing with first 50-100 users
- **When to upgrade:** Users complain about slow loads

### Vercel Free Tier
- No cold starts (always fast)
- 100GB bandwidth/month
- Perfect for thousands of users

---

## 💰 Upgrade Path (When Needed)

**Render Paid ($7/month):**
- No cold starts
- 512MB RAM, better performance
- Persistent disk for uploads

**Railway ($5/month):**
- Alternative to Render
- Better performance
- Built-in database support

---

## 🌐 Add Custom Domain (Optional)

### 1. Buy Domain (~$12/year)
- [Porkbun](https://porkbun.com) - cheapest
- [Namecheap](https://namecheap.com) - popular
- Suggestions: `fridgechef.app`, `fridgechef.co`

### 2. Connect to Vercel
1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add domain (e.g., `fridgechef.app`)
3. Follow DNS setup instructions
4. Wait 1-24 hours for DNS propagation

### 3. Update Backend CORS
Add your custom domain to `ALLOWED_ORIGINS` in Render:
```
https://fridgechef.app,https://fridgechef-xyz.vercel.app
```

---

## 🐛 Troubleshooting

### "Failed to fetch" or CORS errors
1. Check `NEXT_PUBLIC_API_URL` in Vercel matches your Render URL
2. Check `ALLOWED_ORIGINS` in Render includes your Vercel URL
3. Check backend logs in Render dashboard

### Slow first load (30-60 seconds)
- Normal on Render free tier (cold start)
- Upgrade to paid tier or Railway to fix

### Images not persisting
- Render free tier resets local files on redeploy
- Upgrade to paid tier for persistent disk
- Or use Cloudinary/AWS S3 for images

### Backend logs
- Render Dashboard → Your Service → **Logs** tab

---

## 📊 Monitoring

Once deployed, monitor:
- Render logs for backend errors
- Vercel Analytics (built-in, free)
- User feedback on performance

---

## Alternative: Docker Deployment

For self-hosting or cloud platforms:

### Production Checklist
- [ ] Revoke old/exposed API keys
- [ ] Generate strong SECRET_KEY (64+ chars)
- [ ] Set up PostgreSQL database
- [ ] Configure allowed origins for CORS
- [ ] Review rate limiting settings
- [ ] Configure monitoring/logging

### Docker Deployment Steps

1. **Prepare Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Database Setup**
   ```bash
   docker-compose up -d db
   docker-compose exec backend alembic upgrade head
   ```

3. **Start Services**
   ```bash
   docker-compose up -d
   ```

4. **Verify Health**
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

### Cloud Platforms (Advanced)

#### AWS ECS/Fargate
1. Build and push images to ECR
2. Create ECS task definitions
3. Set up Application Load Balancer
4. Configure RDS PostgreSQL

#### Google Cloud Run
1. Build: `gcloud builds submit`
2. Deploy: `gcloud run deploy fridgechef-backend`
3. Set up Cloud SQL PostgreSQL

#### DigitalOcean App Platform
1. Connect GitHub repo
2. Configure build settings
3. Add environment variables
4. Deploy with managed database

---

## 📈 Metrics to Monitor

- API response times
- Error rates (4xx, 5xx)
- Database connection pool usage
- Rate limit violations
- Gemini API quota usage
