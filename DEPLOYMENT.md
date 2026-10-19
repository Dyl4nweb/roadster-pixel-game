# 🚀 ROADSTER 3D: NLEX CYBER SKYWAY - DEPLOYMENT GUIDE

This web application is 100% production-ready and can be deployed directly to cloud hosting platforms like **Render**, **Railway**, **Fly.io**, or **Heroku**.

---

## ⚡ Option 1: Deploy on Render.com (Recommended - Free & Easiest)

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
