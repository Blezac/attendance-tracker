# Church Attendance Tracker - Complete Technical Documentation

## 📋 Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [Database Schema & Design](#database-schema)
3. [Frontend Components](#frontend-components)
4. [Backend Implementation](#backend-implementation)
5. [Monthly Aggregation Logic](#monthly-aggregation)
6. [Deployment Guide](#deployment-guide)
7. [API Reference](#api-reference)

---

## Tech Stack Overview

### Why These Technologies?

**Frontend: React + Vite**
- ✅ Fast development with hot reload
- ✅ Lightweight final bundle (~150KB gzipped)
- ✅ Great for small-to-medium projects
- ✅ Familiar ecosystem

**Database: Supabase (PostgreSQL)**
- ✅ Free tier perfect for churches (500 MB)
- ✅ Real-time subscriptions
- ✅ Built-in authentication
- ✅ Easy REST API
- ✅ No backend server needed

**Hosting: Netlify**
- ✅ Completely free for static sites
- ✅ Automatic HTTPS
- ✅ CDN globally distributed
- ✅ One-click GitHub integration
- ✅ Incredible uptime

### Architecture Diagram
```
┌─────────────────────────────────────────┐
│         Browser (React App)              │
│  - Attendance Form                      │
│  - Monthly Reports                      │
│  - Stats Display                        │
└────────────────┬────────────────────────┘
                 │ HTTPS
                 │
         ┌───────▼────────┐
         │  Netlify CDN   │
         │ (Static Files) │
         └────────────────┘
                 │
                 │ @supabase/supabase-js
                 │
    ┌────────────▼───────────────┐
    │   Supabase Cloud           │
    │  (PostgreSQL Database)     │
    │  - children table          │
    │  - attendance table        │
    │  - offerings table         │
    │  - Row Level Security      │
    └────────────────────────────┘
```

---

## Database Schema

### Full Schema Design

#### Children Table
Primary records for each child in the department.

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
```

**Indexes for Performance:**
```sql
CREATE INDEX idx_children_name ON children(name);
```

---

#### Attendance Table
Core transactional data - records one entry per child per Sunday.

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

-- Prevent duplicate entries for same child on same Sunday
CREATE UNIQUE INDEX idx_attendance_unique ON attendance(child_id, sunday_date);

-- Query optimization indexes
CREATE INDEX idx_attendance_sunday_date ON attendance(sunday_date);
CREATE INDEX idx_attendance_child_id ON attendance(child_id);
```

**Data Examples:**
```
child_id                              sunday_date    present
123e4567-e89b-12d3-a456-426614174000  2025-01-05     true
123e4567-e89b-12d3-a456-426614174000  2025-01-12     true
123e4567-e89b-12d3-a456-426614174000  2025-01-19     false
```

---

#### Offerings Table
Weekly offering aggregates.

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

**Data Examples:**
```
sunday_date    amount    notes
2025-01-05     145.50    Regular collection
2025-01-12     189.75    Special project fund
```

---

#### Monthly Reports (Optional Archive)
```sql
CREATE TABLE monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_month DATE NOT NULL UNIQUE,
  total_offering DECIMAL(10, 2),
  total_children INT,
  average_attendance DECIMAL(5, 2),
  report_data JSONB,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_month ON monthly_reports(report_month);
```

---

## Frontend Components

### Component Tree
```
App.jsx (Main Container)
├── AttendanceForm.jsx (Sunday Attendance)
│   ├── Date Picker (← → Sunday Navigation)
│   ├── Stats Summary (Present/Absent/Total)
│   ├── Children Grid (Checkboxes)
│   ├── Offering Input
│   └── Save Button
│
└── MonthlyReport.jsx (Report View)
    ├── Date Picker (Month Navigation)
    ├── Summary Cards (Total Offering, Children Count)
    ├── Attendance Table
    │   ├── Child Name
    │   ├── Present Count
    │   ├── Absent Count
    │   ├── Total Sundays
    │   └── Attendance %
    └── Print Button
```

### App.jsx - Main Container
- **Role**: Central state management & routing between views
- **State**: currentDate, children, attendanceRecords, view (attendance/report)
- **Data Flow**:
  1. Fetches all children on mount
  2. Listens to date changes
  3. Fetches appropriate records based on view
  4. Passes data to child components

### AttendanceForm.jsx - Attendance Entry
```javascript
// Handles single Sunday attendance
const [attendance, setAttendance] = useState({})
// attendance = { childId: true/false/null, ... }

const handleAttendanceToggle = (childId) => {
  // Cycles: unchecked → present → absent → unchecked
}

const handleSaveAttendance = async () => {
  // 1. Delete old records for this Sunday
  // 2. Insert new attendance records
  // 3. Upsert offering total
  // 4. Refresh UI
}

// Real-time calculations
const presentCount = Object.values(attendance).filter(v => v === true).length
const absentCount = Object.values(attendance).filter(v => v === false).length
```

**Key Features:**
- ✅ Navigate between Sundays
- ✅ Real-time present/absent counts
- ✅ Record offering amount
- ✅ Three-state checkbox (unchecked/present/absent)
- ✅ Per-child status display

### MonthlyReport.jsx - Analytics View
```javascript
const calculateMonthlyStats = async () => {
  // 1. Get all Sundays in month
  // 2. For each child:
  //    - Count present days
  //    - Count absent days
  //    - Calculate attendance %
  // 3. Sum all offerings for month
  // 4. Format for display
}
```

**Calculations:**
```javascript
const stats = {
  [childId]: {
    name: "John Smith",
    present: 4,
    absent: 0,
    total: 4,          // Sundays in month
    attendanceRate: 100 // (4/4) * 100
  }
}
```

---

## Backend Implementation

### Database Connection
```javascript
// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export { supabase }
```

### CRUD Operations

**Read all children:**
```javascript
const { data, error } = await supabase
  .from('children')
  .select('*')
  .order('name')

if (error) console.error(error)
```

**Save attendance:**
```javascript
// 1. Delete existing for this Sunday
await supabase
  .from('attendance')
  .delete()
  .eq('sunday_date', '2025-01-05')

// 2. Insert new records
await supabase
  .from('attendance')
  .insert([
    { child_id: 'uuid-1', sunday_date: '2025-01-05', present: true },
    { child_id: 'uuid-2', sunday_date: '2025-01-05', present: false }
  ])

// 3. Upsert offering
await supabase
  .from('offerings')
  .upsert(
    { sunday_date: '2025-01-05', amount: 145.50 },
    { onConflict: 'sunday_date' }
  )
```

**Query attendance for month:**
```javascript
const { data } = await supabase
  .from('attendance')
  .select('*')
  .gte('sunday_date', '2025-01-01')
  .lte('sunday_date', '2025-01-31')
```

---

## Monthly Aggregation

### Monthly Statistics Calculation

**Algorithm:**
```
For each child in database:
  1. Get all Sundays in selected month
  2. Count attendance records where present=true
  3. Count attendance records where present=false
  4. Calculate percentage = (present / total_sundays) * 100
  5. Mark for display

For offerings:
  1. Sum all offerings.amount for Sundays in month
  2. Calculate average per Sunday
  3. Display in summary
```

**SQL Query Example:**
```sql
-- Get monthly stats for a child
SELECT 
  child_id,
  COUNT(*) FILTER (WHERE present = true) as present_days,
  COUNT(*) FILTER (WHERE present = false) as absent_days,
  COUNT(*) as total_days,
  ROUND(100.0 * COUNT(*) FILTER (WHERE present = true) / COUNT(*), 1) as attendance_pct
FROM attendance
WHERE sunday_date >= '2025-01-01'
  AND sunday_date <= '2025-01-31'
GROUP BY child_id
ORDER BY attendance_pct DESC;
```

**Offering totals:**
```sql
SELECT 
  SUM(amount) as total_offering,
  AVG(amount) as avg_per_sunday,
  COUNT(*) as weeks_collected
FROM offerings
WHERE sunday_date >= '2025-01-01'
  AND sunday_date <= '2025-01-31';
```

### Print-Friendly Report
```javascript
// CSS handles print layout
@media print {
  .btn-print, .navigation { display: none; }
  .report { width: 100%; margin: 0; }
  table { page-break-inside: avoid; }
}
```

---

## Deployment Guide

### Pre-Deployment Checklist
- [ ] All components developed and tested locally
- [ ] Database schema created in Supabase
- [ ] Environment variables configured
- [ ] `.env` file NOT committed to git
- [ ] `.gitignore` configured correctly

### Step 1: Prepare GitHub Repository
```bash
cd /home/computer09/Desktop/Attendance
git init
git add .
git commit -m "Initial commit: Church attendance tracker"
git remote add origin https://github.com/yourusername/attendance-tracker.git
git push -u origin main
```

### Step 2: Create Netlify Site
**Option A: Via Dashboard**
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Select repository
5. Build settings:
   ```
   Build command: npm run build
   Publish folder: dist
   ```
6. Add environment variables:
   - `VITE_SUPABASE_URL`: https://xxxx.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5...
7. Click Deploy

**Option B: Via CLI**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Step 3: Verify Deployment
1. Visit your Netlify URL
2. Test attendance tracking form
3. Verify data saves to Supabase
4. Check monthly report generation
5. Test print functionality

### Step 4: Custom Domain (Optional)
1. In Netlify Settings → Domain management
2. Add custom domain or use provided `.netlify.app` domain
3. Configure DNS if using custom domain

---

## API Reference

### Supabase Client Methods

#### Children
```javascript
// Get all children
supabase.from('children').select('*')

// Get specific child
supabase.from('children').select('*').eq('id', childId)

// Add child
supabase.from('children').insert({ name, guardian_name })

// Update child
supabase.from('children').update({ name }).eq('id', childId)

// Delete child
supabase.from('children').delete().eq('id', childId)
```

#### Attendance
```javascript
// Get attendance for date
supabase.from('attendance')
  .select('*')
  .eq('sunday_date', '2025-01-05')

// Get monthly attendance
supabase.from('attendance')
  .select('*')
  .gte('sunday_date', '2025-01-01')
  .lte('sunday_date', '2025-01-31')

// Insert attendance
supabase.from('attendance').insert(recordsArray)

// Update attendance status
supabase.from('attendance')
  .update({ present: false })
  .eq('id', attendanceId)

// Delete old records
supabase.from('attendance')
  .delete()
  .eq('sunday_date', '2025-01-05')
```

#### Offerings
```javascript
// Get offering for date
supabase.from('offerings').select('*').eq('sunday_date', '2025-01-05')

// Get monthly offerings
supabase.from('offerings')
  .select('amount')
  .gte('sunday_date', '2025-01-01')
  .lte('sunday_date', '2025-01-31')

// Save offering (upsert)
supabase.from('offerings').upsert({
  sunday_date: '2025-01-05',
  amount: 145.50
}, { onConflict: 'sunday_date' })
```

---

## 🎨 Customization Guide

### Change Colors
Edit `src/index.css`:
```css
/* Primary purple → change to your church color */
--primary: #667eea; /* Change here */
--secondary: #764ba2;
```

### Add Church Logo
In `App.jsx` header:
```javascript
<img src="/logo.png" alt="Church Logo" className="church-logo" />
```

### Add More Child Fields
1. Update Supabase table schema
2. Modify form component
3. Update validation

---

## 🔒 Security & Compliance

### Enable Row Level Security (RLS)
```sql
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read
CREATE POLICY "Enable read for authenticated users only"
ON children FOR SELECT
USING (auth.role() = 'authenticated');
```

### Data Privacy
- Store minimal personal data
- Comply with FERPA (if in school)
- Regular backups (Supabase handles automatically)
- Access logs via Supabase dashboard

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Bundle Size | ~150 KB (gzipped) |
| Time to Interactive | <2s |
| Monthly Queries | ~1,000 (free tier: 50M) |
| Database Storage | ~10 MB (free tier: 500 MB) |
| Uptime SLA | 99.95% |

---

## 🆘 Troubleshooting

### Issue: "Supabase connection failed"
**Solution**: Check `.env.local` has correct URL and key

### Issue: "500 error on deploy"
**Solution**: Verify `netlify.toml` build settings

### Issue: "Attendance not saving"
**Solution**: Check browser console (F12) for errors

### Issue: "Monthly report shows 0 records"
**Solution**: Verify records exist in database for that month

---

## 📞 Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev
- **Netlify Docs**: https://docs.netlify.com
- **React Docs**: https://react.dev

