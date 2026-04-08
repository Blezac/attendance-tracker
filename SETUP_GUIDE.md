# Church Attendance Tracker - Complete Setup Guide

## 📋 Tech Stack

### Frontend
- **Framework**: React 18 with Vite (ultra-fast build tool)
- **Styling**: CSS3 with responsive grid/flexbox
- **Date Handling**: date-fns library

### Backend & Database
- **Database**: Supabase (PostgreSQL) - Free tier includes 500 MB storage
- **Authentication**: Supabase Auth (optional, can add later)
- **Real-time**: Supabase Realtime subscriptions

### Deployment
- **Hosting**: Netlify (free tier perfect for static sites)
- **Build**: Vite bundles everything into optimized `dist/` folder

---

## 🗄️ Database Schema Design

### PostgreSQL Tables (Create in Supabase)

#### 1. `children` Table
```sql
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

CREATE INDEX idx_children_name ON children(name);
```

Columns:
- `id`: Unique identifier for each child
- `name`: Child's full name
- `date_of_birth`: Optional, for age tracking
- `email` / `phone`: Contact info
- `guardian_name`: Parent or guardian name
- `created_at` / `updated_at`: Timestamps

#### 2. `attendance` Table
```sql
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
CREATE INDEX idx_attendance_child_id ON attendance(child_id);
```

Columns:
- `id`: Unique record ID
- `child_id`: Foreign key to children table
- `sunday_date`: Date of the Sunday (YYYY-MM-DD format)
- `present`: Boolean true/false
- `notes`: Optional notes (sickness, excused absence, etc.)
- `created_at` / `updated_at`: Timestamps

#### 3. `offerings` Table
```sql
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

Columns:
- `id`: Unique record ID
- `sunday_date`: Date of Sunday (unique constraint - one record per Sunday)
- `amount`: Total offering in dollars
- `notes`: Optional notes
- `created_at` / `updated_at`: Timestamps

#### 4. `monthly_reports` Table (Optional - for archiving)
```sql
CREATE TABLE monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_month DATE NOT NULL UNIQUE, -- First day of month
  total_offering DECIMAL(10, 2),
  total_children INT,
  average_attendance DECIMAL(5, 2),
  report_data JSONB, -- Store full aggregated data
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_month ON monthly_reports(report_month);
```

---

## 🚀 Setup Steps

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up (free tier)
3. Create a new project
4. Choose a region close to your location
5. Wait for PostgreSQL database initialization

### Step 2: Create Tables in Supabase
1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query and paste each table creation SQL above
3. Execute each query

### Step 3: Create a Child Record (for testing)
```sql
INSERT INTO children (name, guardian_name)
VALUES ('John Smith', 'Mary Smith');
```

### Step 4: Get API Keys
1. Go to **Settings → API**
2. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

### Step 5: Configure Environment Variables
```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6: Install Dependencies
```bash
npm install
```

### Step 7: Run Locally
```bash
npm run dev
# Opens at http://localhost:5173
```

---

## 📊 Key Features & Code

### Auto-Calculate Present/Absent
The `AttendanceForm.jsx` component tracks attendance state:

```javascript
const [attendance, setAttendance] = useState({})

const presentCount = Object.values(attendance).filter(v => v === true).length
const absentCount = Object.values(attendance).filter(v => v === false).length
```

Updates live as you check/uncheck checkboxes.

### Monthly Aggregation
`MonthlyReport.jsx` calculates:
- Total Sundays in month
- Per-child present/absent counts
- Attendance percentage
- Total offerings for month

### Save to Database
```javascript
const handleSaveAttendance = async () => {
  // 1. Clear old records for this Sunday
  // 2. Insert attendance records
  // 3. Upsert offering record
  // 4. Refresh UI
}
```

---

## 🌐 Deploy to Netlify

### Option 1: GitHub Integration (Recommended)
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click **Add new site → Import an existing project**
4. Connect GitHub
5. Select repository
6. Build settings:
   - Build command: `npm run build`
   - Publish folder: `dist`
7. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
8. Deploy!

### Option 2: Netlify CLI
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### Option 3: Manual Deploy
```bash
# Build the app
npm run build

# Drag the `dist/` folder to Netlify dashboard
# Or use: netlify deploy --prod --dir=dist
```

---

## 🔐 Security Considerations

### Row Level Security (RLS)
Enable RLS on tables if adding authentication:

```sql
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;

-- Example policy: Can create/update own records
CREATE POLICY "Users can manage their records"
ON attendance FOR ALL
USING (auth.uid() IS NOT NULL);
```

### API Key Management
- Use `anon` key for frontend (public browsing)
- Use `service_role` key only for backend/admin
- Rotate keys if compromised
- Never commit `.env` files to git

---

## 📅 Data Timeline

- **Tracking Starts**: January 2025
- **Record Structure**: One record per child per Sunday
- **Monthly Reports**: Auto-generate on last Sunday
- **Retention**: Keep all historical data for trend analysis

---

## 🎯 Future Enhancements

1. **Authentication**: Add church admin login
2. **Photo Upload**: Store child photos
3. **SMS Reminders**: Send parent reminders on Saturday
4. **Analytics**: Charts showing attendance trends
5. **Export to Excel**: Download monthly reports
6. **Mobile App**: React Native version
7. **Notifications**: Alert if child hasn't appeared in 3 weeks

---

## 📞 Support

For issues:
1. Check browser console (F12) for errors
2. Check Netlify deployment logs
3. Verify Supabase database is accessible
4. Test API keys are correct in `.env`

