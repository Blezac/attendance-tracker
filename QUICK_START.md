# 🚀 QUICK START GUIDE - 5 Steps to Deployment

Your church attendance tracker is ready. Follow these 5 steps to go live.

---

## ⏱️ Estimated Time: 30 minutes

---

## STEP 1: Create Supabase Project (5 minutes)

### 1a. Sign Up
- Go to **https://supabase.com**
- Click **Start your project**
- Sign up with email or GitHub
- Choose a region close to your location

### 1b. Create Tables
Inside your new project, go to **SQL Editor** and run this:

```sql
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  guardian_name VARCHAR(255),
  date_of_birth DATE,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  sunday_date DATE NOT NULL,
  present BOOLEAN NOT NULL DEFAULT true,
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_attendance_unique ON attendance(child_id, sunday_date);
CREATE INDEX idx_attendance_sunday_date ON attendance(sunday_date);

CREATE TABLE offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sunday_date DATE NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offerings_sunday_date ON offerings(sunday_date);
```

### 1c. Add Sample Children
```sql
INSERT INTO children (name, guardian_name) VALUES
();
```

### 1d. Get Your API Keys
1. Click **Settings** (⚙️) in left sidebar
2. Click **API**
3. Copy these:
   - **Project URL** → Save as `VITE_SUPABASE_URL`
   - **anon public** key → Save as `VITE_SUPABASE_ANON_KEY`

---

## STEP 2: Configure Project Locally (5 minutes)

### 2a. Create .env.local
```bash
cd /home/computer09/Desktop/Attendance
cp .env.example .env.local
```

### 2b. Edit .env.local
Open `.env.local` in your editor and paste:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual values from Step 1d.

---

## STEP 3: Install & Test Locally (5 minutes)

### 3a. Install Dependencies
```bash
cd /home/computer09/Desktop/Attendance
npm install
```

### 3b. Run Development Server
```bash
npm run dev
```

### 3c. Test in Browser
- Open **http://localhost:5173**
- You should see the attendance form
- Try marking a child present
- Enter offering amount
- Click "Save Attendance & Offering"
- Check the monthly report tab

---

## STEP 4: Deploy to Netlify (10 minutes)

### Option A: GitHub Method (Recommended)

#### 4A1. Push to GitHub
```bash
cd /home/computer09/Desktop/Attendance
git init
git add .
git commit -m "Church attendance tracker"
git remote add origin https://github.com/YOUR_USERNAME/attendance-tracker.git
git push -u origin main
```

#### 4A2. Deploy to Netlify
1. Go to **https://netlify.com**
2. Click **Sign up** (with GitHub)
3. Click **Add new site → Import an existing project**
4. Choose **GitHub** and select your repo
5. Build settings:
   - Build command: `npm run build`
   - Publish folder: `dist`
6. Click **New variable** and add:
   - Key: `VITE_SUPABASE_URL` → Value: (your URL)
   - Key: `VITE_SUPABASE_ANON_KEY` → Value: (your key)
7. Click **Deploy site**

#### 4A3. Get Live URL
- Netlify gives you a URL like: `https://your-site.netlify.app`
- This is your live website!

### Option B: Netlify CLI Method

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

## STEP 5: Verify It Works (5 minutes)

### 5a. Visit Your Live Site
- Open the URL provided by Netlify
- Should load immediately

### 5b. Test All Features
- [ ] Mark attendance
- [ ] Save offering
- [ ] View monthly report
- [ ] Print report
- [ ] Works on mobile (rotate phone)

### 5c. Check Database
- Go back to Supabase dashboard
- Check `attendance` table → your data is there
- Check `offerings` table → offering recorded

---

## ✅ You're LIVE!

Your church attendance tracker is now live and ready to use every Sunday!

---

## 📞 Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| "npm install fails" | `npm cache clean --force` then try again |
| "Cannot connect to Supabase" | Check `.env.local` has correct values |
| "Site shows 404 error" | Wait 3-5 minutes for Netlify to finish building |
| "Attendance not saving" | Open browser DevTools (F12) → Console → look for errors |
| "Monthly report shows no data" | Add more attendance records to database |

---

## 📚 Full Documentation

Now that you're live, here's how to use the full docs:

- **README.md** - Features and overview
- **SETUP_GUIDE.md** - Detailed setup (you just did this!)
- **TECHNICAL_DOCUMENTATION.md** - How the code works
- **SQL_REFERENCE.md** - Database queries
- **DEPLOYMENT_CHECKLIST.md** - Pre-launch verification (next time)
- **FILE_INVENTORY.md** - What each file does

---

## 🎯 Next Steps (Optional)

### Add More Children
```sql
INSERT INTO children (name, guardian_name) VALUES
('New Child Name', 'Guardian Name');
```

### Customize Colors
Edit `src/index.css` and change `#667eea` to your church color, then:
```bash
npm run build
git add .
git commit -m "Changed colors"
git push
# Netlify auto-deploys!
```

### Add Logo
Put image in `public/` folder, then reference in `src/App.jsx`

### Add Authentication (Complex - Optional)
See TECHNICAL_DOCUMENTATION.md → Security section

---

## 💰 Cost Summary

| Service | Free Tier | Your Needs |
|---------|-----------|-----------|
| Supabase | 500 MB + 50 GB bandwidth | ✅ Plenty |
| Netlify | Unlimited static sites | ✅ Perfect |
| Domain | .netlify.app (free) | ✅ Included |
| **Total Monthly Cost** | **$0** | ✅ **FREE** |

---

## 🎉 Congratulations!

Your church now has a professional attendance tracking system that:

✅ Tracks Sunday attendance  
✅ Records offerings  
✅ Generates monthly reports  
✅ Is accessible worldwide  
✅ Costs $0/month  
✅ Requires zero maintenance  

**Total setup time: 30 minutes**  
**Data stored safely: Supabase**  
**Your data is backed up automatically**

---

## 📞 Need Help?

1. **Check the documentation** - Most answers are there
2. **Browser Console** - F12 → Console tab shows errors
3. **Supabase Dashboard** - Check if data is saving
4. **Netlify Logs** - Deployment logs show build errors

---

**Ready to track? Go to your Netlify URL and start using it!**

Each Sunday:
1. Select the date
2. Check off present children
3. Enter offering amount
4. Click Save
5. Done!

And every month:
1. Go to Monthly Report tab
2. Print professional summary
3. Email to church leadership

Enjoy! 🙏

