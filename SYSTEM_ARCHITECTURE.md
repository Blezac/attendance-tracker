# 🏗️ SYSTEM ARCHITECTURE & DIAGRAMS

Visual representations of how your church attendance tracker works.

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (Church Admin)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Opens browser
                     ↓
┌─────────────────────────────────────────────────────────────┐
│           Browser (React Application)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  App.jsx                                               │ │
│  │  ├─ Manages state & routing                           │ │
│  │  ├─ AttendanceForm (when view = 'attendance')        │ │
│  │  └─ MonthlyReport (when view = 'report')             │ │
│  └────────────────────────────────────────────────────────┘ │
│                     │                                        │
│  Attendance Entry  │  Real-time Stats  │  Save Action       │
└─────────────────────┼────────────────────────────────────────┘
                      │ HTTPS
                      ↓
        ┌─────────────────────────────┐
        │  Netlify CDN                │
        │  (Serves your app globally) │
        └─────────────┬───────────────┘
                      │ @supabase/supabase-js
                      ↓
┌─────────────────────────────────────────────────────────────┐
│          Supabase Cloud (PostgreSQL)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  children table                                        │ │
│  │  ├─ id, name, guardian_name, etc.                     │ │
│  │  └─ Stores all church children                        │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  attendance table                                      │ │
│  │  ├─ child_id, sunday_date, present                    │ │
│  │  ├─ One record per child per Sunday                   │ │
│  │  └─ Indexes: unique(child_id, sunday_date)           │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  offerings table                                       │ │
│  │  ├─ sunday_date (unique), amount                       │ │
│  │  └─ One record per Sunday                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Features:                                                   │
│  ✓ Automatic daily backups                                  │
│  ✓ Real-time REST API                                       │
│  ✓ Row-level security available                             │
│  ✓ 500 MB free storage                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🏢 Component Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    App.jsx                               │
│              (Main Container)                            │
│  State:                                                  │
│  • currentDate                                           │
│  • children[]                                            │
│  • attendanceRecords[]                                   │
│  • view ('attendance' | 'report')                        │
└────────────┬─────────────────────────────────────────────┘
             │
             ├─────────────────────┬──────────────────────┐
             ↓                     ↓                      ↓
    ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐
    │ AttendanceForm  │  │ MonthlyReport    │  │ Utilities     │
    ├──────────────────┤  ├──────────────────┤  ├───────────────┤
    │ • Date picker    │  │ • Month select   │  │ calculations  │
    │ • Checkboxes     │  │ • Stats table    │  │ .js           │
    │ • Offering input │  │ • Print button   │  └───────────────┘
    │ • Save button    │  │ • Export func    │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             └─────────────┬───────┘
                           │
         ┌─────────────────┴──────────────────┐
         ↓                                    ↓
    ┌──────────────────┐  ┌──────────────────┐
    │ supabaseClient   │  │ calculations.js  │
    │ .js              │  │ (utilities)      │
    │                  │  │ • getSundays()   │
    │ Database         │  │ • calcStats()    │
    │ Connection       │  │ • formatDates()  │
    └──────────────────┘  └──────────────────┘
```

---

## 📊 Database Schema Diagram

```
┌────────────────────────────┐
│        CHILDREN            │
├────────────────────────────┤
│ 🔑 id (UUID)               │
│ • name (VARCHAR)           │
│ • guardian_name (VARCHAR)  │
│ • date_of_birth (DATE)     │
│ • email (VARCHAR)          │
│ • phone (VARCHAR)          │
│ • created_at (TIMESTAMP)   │
│ • updated_at (TIMESTAMP)   │
│                            │
│ ⚡ Index: name             │
└────────┬───────────────────┘
         │ 1
         │ (has many)
         │
         │ M (one per child per Sunday)
         │
┌────────▼───────────────────┐
│      ATTENDANCE            │
├────────────────────────────┤
│ 🔑 id (UUID)               │
│ 🔗 child_id (UUID) ← FK    │
│ • sunday_date (DATE)       │
│ • present (BOOLEAN)        │
│ • notes (VARCHAR)          │
│ • created_at (TIMESTAMP)   │
│ • updated_at (TIMESTAMP)   │
│                            │
│ ⚡ Indexes:                │
│   • UNIQUE(child_id,       │
│      sunday_date)          │
│   • sunday_date            │
│   • child_id               │
└────┬───────────────────────┘
     │
     │ (aggregates to)
     │
┌────▼───────────────────────┐
│       OFFERINGS            │
├────────────────────────────┤
│ 🔑 id (UUID)               │
│ • sunday_date (DATE)       │
│ • amount (DECIMAL)         │
│ • notes (VARCHAR)          │
│ • created_at (TIMESTAMP)   │
│ • updated_at (TIMESTAMP)   │
│                            │
│ ⚡ Index: sunday_date      │
│ ⚡ UNIQUE: sunday_date     │
└────────────────────────────┘
```

---

## 🔄 Attendance Recording Flow

```
User Marks Attendance
        │
        ↓
    ┌─────────────────────────────────┐
    │ AttendanceForm.jsx              │
    │ handleAttendanceToggle()         │
    └────────────┬────────────────────┘
                 │
                 ↓
    ┌─────────────────────────────────┐
    │ State Update: attendance = {     │
    │   childId1: true,  ← Child 1    │
    │   childId2: false, ← Child 2    │
    │   childId3: null   ← Unchecked  │
    │ }                               │
    └────────────┬────────────────────┘
                 │
                 ↓
    ┌─────────────────────────────────┐
    │ Real-Time Calculation:          │
    │ presentCount = 1                │
    │ absentCount = 1                 │
    └────────────┬────────────────────┘
                 │
                 ↓
    ┌─────────────────────────────────┐
    │ Display to User:                │
    │ ┌─────────┐ ┌────────┐          │
    │ │Present │ │ Absent │          │
    │ │   1    │ │   1    │          │
    │ └─────────┘ └────────┘          │
    └────────────┬────────────────────┘
                 │
    User enters offering amount
                 │
                 ↓
    ┌─────────────────────────────────┐
    │ User clicks "Save"              │
    └────────────┬────────────────────┘
                 │
                 ↓
    ┌─────────────────────────────────┐
    │ handleSaveAttendance() {         │
    │   // Delete old records         │
    │   // Insert new records         │
    │   // Upsert offering            │
    │   // Refresh data               │
    │ }                               │
    └────────────┬────────────────────┘
                 │ HTTPS Request
                 ↓
┌───────────────────────────────────────┐
│   Supabase API                        │
│   1. DELETE attendance where          │
│      sunday_date = '2025-01-12'       │
│   2. INSERT new attendance records    │
│   3. UPSERT offering                  │
│   4. Return success                   │
└───────────────────────────────────────┘
                 │
                 ↓
    ┌─────────────────────────────────┐
    │ ✓ Data Saved!                   │
    │ ✓ Show "Success" Message        │
    └─────────────────────────────────┘
```

---

## 📈 Monthly Report Generation Flow

```
User Selects Months Report
        │
        ↓
┌─────────────────────────────────────┐
│ App.jsx - fetchAttendanceRecords()   │
│ Query: attendance records for month │
│ (e.g., 2025-01-01 to 2025-01-31)   │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ MonthlyReport.jsx                   │
│ calculateMonthlyStats()             │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ For each child:                     │
│  1. getSundaysInMonth() → 4 Sundays │
│  2. Count present days → 3          │
│  3. Count absent days → 1           │
│  4. Calculate rate → 75%            │
│  5. Add to stats object             │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ Fetch offerings for month           │
│ Sum total → $614.50                 │
│ Calculate average → $153.63         │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ Render Table:                       │
│ ┌─────────┬────┬────┬────┬──────┐  │
│ │ Child   │ P  │ A  │ T  │ %    │  │
│ ├─────────┼────┼────┼────┼──────┤  │
│ │ John    │ 3  │ 1  │ 4  │ 75%  │  │
│ │ Sarah   │ 4  │ 0  │ 4  │ 100% │  │
│ │ Emma    │ 3  │ 1  │ 4  │ 75%  │  │
│ └─────────┴────┴────┴────┴──────┘  │
│                                     │
│ Offering Total: $614.50             │
└────────────┬────────────────────────┘
             │
    User clicks "Print"
             │
             ↓
┌─────────────────────────────────────┐
│ Browser Print Dialog Opens          │
│ Prints professional report          │
│ (print.css handles layout)           │
└─────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
GitHub Repository
├─ Source Code
├─ Documentation
└─ Configuration

    Push to GitHub
         │
         ↓
┌─────────────────────────────────┐
│      Netlify                    │
│ Detects new commit              │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Build Process                   │
│ 1. npm install                  │
│ 2. npm run build                │
│ 3. Output → dist/               │
│    • index.html                 │
│    • main.[hash].js (~100 KB)   │
│    • style.[hash].css           │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Deploy to CDN                   │
│ • Global distribution           │
│ • HTTPS enabled                 │
│ • Caching optimized             │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Your Live URL                   │
│ https://yourchurch.netlify.app  │
│ or custom domain                │
└─────────────────────────────────┘
```

---

## 🔐 Security Architecture

```
┌──────────────────────────────────────┐
│        Browser                       │
│  (Your React App)                    │
└────────────┬───────────────────────┐ │
             │                       │ │
    Public (anon) key only          │ │
             │                       │ │
             ↓                       ↓ 
┌────────────────────────────────────────────┐
│     Internet (HTTPS - Encrypted)           │
└────────────┬───────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│      Supabase                            │
│  ┌──────────────────────────────────┐   │
│  │ Authentication Layer             │   │
│  │ • Validates JWT token            │   │
│  │ • Enforces policies              │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ PostgreSQL Database              │   │
│  │ • Encrypted at rest              │   │
│  │ • Daily backups                  │   │
│  │ • Row-level security ready       │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ Automatic Backups                │   │
│  │ • Hourly                         │   │
│  │ • Daily                          │   │
│  │ • Point-in-time restore          │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

---

## 📱 Responsive Design Breakpoints

```
Mobile Phone          Tablet            Desktop
< 480px              480px - 768px      768px - 1024px    1024px+

┌─────────────┐    ┌───────────────┐    ┌──────────────┐    ┌───────────────┐
│   Single    │    │   Two Column  │    │ Three Column │    │  Wide Layout  │
│   Column    │    │   Layout      │    │   at max     │    │  Full width   │
│             │    │               │    │              │    │               │
│ ┌─────────┐ │    │ ┌─────┬─────┐ │    │ ┌────┬────┬─ │    │ ┌────┬────┬─  │
│ │Children │ │    │ │Child│Child│ │    │ │Stat│Stat│ │    │ │Stat│Stat│  │
│ │ Grid 1  │ │    │ │  1  │  2  │ │    │ │ 1  │ 2  │ │    │ │ 1  │ 2  │  │
│ ├─────────┤ │    │ │     │     │ │    │ │    │    │ │    │ │    │    │  │
│ │Button   │ │    │ └─────┴─────┘ │    │ └────┼────┼─ │    │ └────┼────┼─  │
│ └─────────┘ │    │ ┌─────┬─────┐ │    │ ┌────┴────┴─ │    │ ┌────┴────┬─  │
└─────────────┘    │ │Child│Child│ │    │ │Table....  │    │ │Long Table   │
                   │ │  3  │  4  │ │    │ │........   │    │ │............ǁ
                   │ └─────┴─────┘ │    │ │........   │    │ │............ǁ
                   │ ┌─────────────┐ │    │ │........   │    │ └────────────┘
                   │ │Button       │ │    │ └────┬────┬─ │    │
                   │ └─────────────┘ │    │      └────┴─ │    │
                   └───────────────┘    └──────────────┘    └───────────────┘

Mobile: Stack vertically, full width
Tablet: Split columns for better use of space
Desktop: Expanded layouts with multiple columns
```

---

## 💾 Data Persistence Flow

```
Browser Memory
(React State)
     │
     │ User makes change
     │
     ↓
┌─────────────────────────────┐
│ React Component Updates     │
│ • State changes             │
│ • UI re-renders             │
└────────────┬────────────────┘
             │
    User clicks "Save"
             │
             ↓
┌─────────────────────────────────────┐
│ Send to Supabase                    │
│ • API Request (JSON)                │
│ • @supabase/supabase-js             │
└────────────┬────────────────────────┘
             │ HTTPS
             ↓
┌─────────────────────────────────────┐
│ Supabase Cloud                      │
│ • Parse request                     │
│ • Validate                          │
│ • Write to PostgreSQL               │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ PostgreSQL Database                 │
│ • Data persisted to disk            │
│ • Automatic backup started          │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ Return Success                      │
│ • Confirmation message              │
│ • Data now permanent                │
└─────────────────────────────────────┘
```

---

## 📊 Calculation Process

```
Monthly Report Calculation
        │
        ↓
    get all Sundays in month
        │
        ├─ Jan 5 ✓
        ├─ Jan 12 ✓
        ├─ Jan 19 ✓
        └─ Jan 26 ✓
        │ Total: 4
        │
        ↓
    For each child:
        │
        ├─ Query attendance for month
        │
        ├─ Count present = 3
        ├─ Count absent = 1
        ├─ Count total = 4
        │
        └─ Calculate rate = (3/4) * 100 = 75%
        
        Result: {
            name: "John Smith",
            present: 3,
            absent: 1,
            total: 4,
            attendanceRate: 75
        }
        
    For offerings:
        │
        ├─ Sum all amounts for month
        │   = $145.50 + $189.75 + $156.25 + $123.00
        ├─ Total = $614.50
        ├─ Average = $614.50 / 4 = $153.63
        │
        └─ Display in report
```

---

These diagrams show how your entire system works together.

**Key Takeaway**: User interface → React state → Supabase database → Automatic backups worldwide.

Simple, efficient, reliable. ✨

