# Deploy Frontend to Railway

## 🚀 Create Second Service in Railway

### Step 1: Add New Service
1. In your Railway project dashboard
2. Click **"+ New"** button (top right)
3. Select **"GitHub Repo"**
4. Choose your `storypoint-poker` repository
5. Click **"Deploy"**

### Step 2: Configure the Frontend Service
After Railway creates the service:

1. **Go to Settings tab**
2. **Build Settings:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Root Directory:** Leave as `.` (root) - this is for the Next.js app

3. **Environment Variables:**
   - Go to **"Variables"** tab
   - Add:
     - **Key:** `NEXT_PUBLIC_SOCKET_URL`
     - **Value:** `https://storypoint-poker-production.up.railway.app`
     - (This is your Socket.io server URL)

4. **Generate Domain:**
   - Go to **"Networking"** section
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `https://storypoint-poker-frontend-production.up.railway.app`)

### Step 3: Update Backend CORS (Optional)
The backend already allows all origins, so this should work automatically. But if you want to be more specific:

1. Go to your **Socket.io server service** → **Variables**
2. Add/Update:
   - **Key:** `FRONTEND_URL`
   - **Value:** Your new frontend Railway URL

## ✅ Result

You'll have two services in Railway:
- **Service 1:** Socket.io Server - `https://storypoint-poker-production.up.railway.app`
- **Service 2:** Next.js Frontend - `https://your-frontend-url.up.railway.app`

## 🎯 Test Your App

1. Open your frontend Railway URL in browser
2. You should see the Story Point Poker home page
3. Create a room and test real-time features!

## 💡 Benefits of Railway for Both

- ✅ Everything in one place
- ✅ Easy to manage both services
- ✅ Free tier available ($5 credit/month)
- ✅ Automatic deployments from GitHub

