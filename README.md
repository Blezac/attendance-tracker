# ⛪ Church Attendance Tracker

A modern web application for tracking Sunday school attendance and offerings in your church's children's department.

## 🎯 Features

- ✅ **Weekly Attendance Tracking**: Tick off present/absent for each child every Sunday
- ✅ **Real-time Statistics**: Auto-calculate present/absent counts
- ✅ **Offering Records**: Track weekly donations
- ✅ **Monthly Reports**: Aggregate attendance data by month with percentages
- ✅ **Printable Reports**: Generate professional monthly reports
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Cloud Database**: All data backed up in Supabase
- ✅ **Free Hosting**: Deploy to Netlify with zero cost

## 🛠 Tech Stack

| Component | Technology | Why? |
|-----------|-----------|------|
| **Frontend** | React 18 + Vite | Fast, lightweight, modern |
| **Database** | Supabase (PostgreSQL) | Free, reliable, built-in API |
| **Hosting** | Netlify | Free static hosting, auto-deploys |
| **Styling** | CSS3 | No dependencies, full control |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org))
- A Supabase account (free at [supabase.com](https://supabase.com))

### 1. Clone or Download Project
```bash
cd /home/computer09/Desktop/Attendance
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

#### Create Tables
Go to your Supabase dashboard → SQL Editor and run:

```sql
-- Children table
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  email VARCHAR(255),
  phone VARCHAR(20),
  guardian_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
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

-- Offerings table
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

#### Add Sample Children
```sql
INSERT INTO children (name, guardian_name) VALUES
('John Smith', 'Mary Smith'),
('Sarah Johnson', 'Michael Johnson'),
('Emma Davis', 'Jennifer Davis'),
('Noah Wilson', 'David Wilson'),
('Olivia Brown', 'Lisa Brown');
```

#### Get Your API Keys
1. Go to **Settings → API** in Supabase
2. Copy:
   - `Project URL` → VITE_SUPABASE_URL
   - `anon key` → VITE_SUPABASE_ANON_KEY

### 4. Configure Environment
Create `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Run Locally
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📊 How to Use

### Mark Attendance
1. Navigate to **Attendance** tab
2. Select Sunday date (use arrow buttons)
3. Check boxes for children present
4. Enter weekly offering amount
5. Click **Save Attendance & Offering**

### View Monthly Report
1. Navigate to **Monthly Report** tab
2. Select the month
3. View attendance percentages and offering totals
4. Click **Print** for a professional report

## 📁 Project Structure

```
Attendance/
├── src/
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   ├── supabaseClient.js         # Database connection
│   ├── index.css                 # Global styles
│   ├── components/
│   │   ├── AttendanceForm.jsx    # Sunday form
│   │   └── MonthlyReport.jsx     # Report view
│   └── utils/
│       └── calculations.js        # Helper functions
├── SETUP_GUIDE.md                # Detailed setup
├── TECHNICAL_DOCUMENTATION.md    # Full technical docs
├── netlify.toml                  # Netlify config
├── vite.config.js                # Vite config
├── package.json                  # Dependencies
├── index.html                    # HTML entry
└── README.md                     # This file
```

## 🌐 Deploy to Netlify

### Option 1: GitHub Integration (Recommended)
```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Then in Netlify:
# 1. Sign up at netlify.com
# 2. Click "New site from Git"
# 3. Connect your GitHub repo
# 4. Build command: npm run build
# 5. Publish folder: dist
# 6. Add environment variables
# 7. Deploy!
```

### Option 2: CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## 📊 Database Schema Quick Reference

### Children
- id (UUID)
- name (string)
- guardian_name (string)
- date_of_birth (date) - optional
- email (string) - optional
- phone (string) - optional

### Attendance
- id (UUID)
- child_id (FK → children)
- sunday_date (date)
- present (boolean)
- notes (string) - optional

### Offerings
- id (UUID)
- sunday_date (date) - unique
- amount (decimal)
- notes (string) - optional

## 🎨 Customization

### Change App Title
Edit `index.html`:
```html
<title>Your Church Name - Attendance Tracker</title>
```

### Change Colors
Edit `src/index.css` - search for `#667eea` and replace with your color

### Add Custom Fields
1. Add column to Supabase table
2. Update React component form
3. Update save/load logic

## security & Privacy

- ✅ HTTPS only (Netlify enforces)
- ✅ Database credentials in `.env` (never committed)
- ✅ Row-level security available (can be enabled)
- ✅ Daily Supabase backups (automatic)

## troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to Supabase" | Check `.env.local` has correct credentials |
| "npm install fails" | Try `npm cache clean --force` then `npm install` |
| "404 on deployment" | Ensure `netlify.toml` exists and `npm run build` works |
| "Attendance not saving" | Open DevTools (F12) → Console tab, look for errors |

## 📈 Example Data for January 2025

```
Week 1 (Jan 5):   5 children present, 0 absent, $145.50
Week 2 (Jan 12):  4 children present, 1 absent, $189.75
Week 3 (Jan 19):  5 children present, 0 absent, $156.25
Week 4 (Jan 26):  3 children present, 2 absent, $123.00
```

**Monthly Summary:**
- Total children: 5
- Average attendance: 85%
- Total offering: $614.50

## 📞 Support

### Local Development Issues
1. Delete `node_modules/` folder
2. Delete `package-lock.json`
3. Run `npm install`
4. Run `npm run dev`

### Database Issues
1. Check Supabase dashboard for errors
2. Verify tables exist: SQL Editor → Show all tables
3. Check API key permissions

### Deployment Issues
1. Verify `npm run build` works locally
2. Check Netlify deployment logs
3. Confirm environment variables are set

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Technical Documentation](./TECHNICAL_DOCUMENTATION.md) - Full technical reference
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)

## 📄 License

This project is provided as-is for church use. Free to modify and distribute.

## 🙏 Support This Project

This attendance tracker is built to serve your church ministry at no cost.

---

**Last Updated**: April 2026

Questions? See [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) for detailed answers.
