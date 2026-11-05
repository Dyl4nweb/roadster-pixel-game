# 🚀 ROADSTER 3D: NLEX CYBER SKYWAY - DEPLOYMENT GUIDE

This web application is 100% production-ready and configured for instant deployment to **Vercel**, **Render**, **Railway**, or **Fly.io**.

---

## ▲ Option 1: Deploy on Vercel (Fastest & 100% Free CDN)

Your repository already includes the official Vercel configuration files:
* [`vercel.json`](file:///c:/Projects/Python%20Game/vercel.json): Configures automatic routing to the serverless function.
* [`api/index.py`](file:///c:/Projects/Python%20Game/api/index.py): WSGI entry point for Vercel Serverless Functions.
* [`requirements.txt`](file:///c:/Projects/Python%20Game/requirements.txt): Installs `Flask`.

### Step-by-Step Vercel Deployment via Web Dashboard (Recommended):
1. **Push your latest changes to GitHub** (already done on `https://github.com/Dyl4nweb/roadster-pixel-game.git`).
2. Go to [vercel.com](https://vercel.com/) and sign in with your GitHub account.
3. Click **"Add New..."** &rarr; **"Project"**.
4. In the list of repositories, select **`roadster-pixel-game`** and click **"Import"**.
5. Leave all build settings at their defaults (Vercel automatically detects `vercel.json` and `api/index.py`).
6. Click **"Deploy"**.
7. In about 30–45 seconds, your game will be live with an SSL HTTPS domain, e.g.:
   `https://roadster-pixel-game.vercel.app`

### Deploy via Vercel CLI (Optional):
```bash
npm install -g vercel
vercel
```

---

## ⚡ Option 2: Deploy on Render.com (Free Web Service)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Deploy Roadster 3D"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Create a Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com/) and click **"New +" &rarr; "Web Service"**.
   - Connect your GitHub repository.
   - Configure the following settings:
     - **Name**: `roadster-3d` (or any name you prefer)
     - **Region**: Singapore (Southeast Asia) or US
     - **Branch**: `main`
     - **Runtime**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`
     - **Instance Type**: `Free`

3. **Click "Create Web Service"**:
   - Render will build and deploy your game. Once finished, you will receive a public URL like:
     `https://roadster-3d.onrender.com`

---

## 🚂 Option 2: Deploy on Railway.app

1. Go to [railway.app](https://railway.app/) and sign in with GitHub.
2. Click **"New Project" &rarr; "Deploy from GitHub repo"**.
3. Select your repository.
4. Railway will automatically detect the `Procfile` and `requirements.txt` and deploy the app instantly.

---

## 📦 Key Files Included for Cloud Deployment

* [`Procfile`](file:///c:/Projects/Python%20Game/Procfile): Tells cloud servers to run `gunicorn app:app`.
* [`requirements.txt`](file:///c:/Projects/Python%20Game/requirements.txt): Contains `Flask` and `gunicorn`.
* [`app.py`](file:///c:/Projects/Python%20Game/app.py): Configured with dynamic port binding (`int(os.environ.get('PORT', 5000))`) and `0.0.0.0` host.
* [`leaderboard.json`](file:///c:/Projects/Python%20Game/leaderboard.json): Persistent file-based storage for the Global Hall of Fame.

---

## 🌐 Routes Available After Deployment

* `/` &mdash; **Official Home Page & Leaderboard Hub**
* `/play` &mdash; **Full 3D Retro Arcade Game**
* `/thrusters` &mdash; **Cold-Gas Thruster 9:16 Cinematic Video**
* `/api/leaderboard` &mdash; **REST API (GET list & POST score)**
