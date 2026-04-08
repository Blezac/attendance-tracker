# SQL Reference Guide - Church Attendance Tracker

Complete SQL queries for managing your attendance database.

## Table Creation

### Step 1: Create Children Table
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

-- Indexes for faster queries
CREATE INDEX idx_children_name ON children(name);
```

### Step 2: Create Attendance Table
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

-- Prevent duplicate entries (one entry per child per Sunday)
CREATE UNIQUE INDEX idx_attendance_unique ON attendance(child_id, sunday_date);

-- Query optimization indexes
CREATE INDEX idx_attendance_sunday_date ON attendance(sunday_date);
CREATE INDEX idx_attendance_child_id ON attendance(child_id);
```

### Step 3: Create Offerings Table
```sql
CREATE TABLE offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sunday_date DATE NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query optimization
CREATE INDEX idx_offerings_sunday_date ON offerings(sunday_date);
```

### Step 4: Create Monthly Reports Table (Optional)
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

## Sample Data

### Insert Sample Children
```sql
INSERT INTO children (name, guardian_name, date_of_birth, email, phone) VALUES
('John Smith', 'Mary Smith', '2018-03-15', 'john.smith@email.com', '555-0101'),
('Sarah Johnson', 'Michael Johnson', '2017-07-22', 'sarah.j@email.com', '555-0102'),
('Emma Davis', 'Jennifer Davis', '2019-01-10', 'emma.d@email.com', '555-0103'),
('Noah Wilson', 'David Wilson', '2018-11-30', 'noah.w@email.com', '555-0104'),
('Olivia Brown', 'Lisa Brown', '2017-05-05', 'olivia.b@email.com', '555-0105'),
('Ethan Taylor', 'James Taylor', '2019-09-12', 'ethan.t@email.com', '555-0106'),
('Sophia Anderson', 'Robert Anderson', '2018-02-28', 'sophia.a@email.com', '555-0107'),
('Liam Thomas', 'Patricia Thomas', '2017-12-15', 'liam.t@email.com', '555-0108');
```

### Insert Sample Attendance (January 2025)
```sql
-- Week 1: January 5, 2025
INSERT INTO attendance (child_id, sunday_date, present, notes) VALUES
((SELECT id FROM children WHERE name = 'John Smith'), '2025-01-05', true, ''),
((SELECT id FROM children WHERE name = 'Sarah Johnson'), '2025-01-05', true, ''),
((SELECT id FROM children WHERE name = 'Emma Davis'), '2025-01-05', false, 'Sick'),
((SELECT id FROM children WHERE name = 'Noah Wilson'), '2025-01-05', true, ''),
((SELECT id FROM children WHERE name = 'Olivia Brown'), '2025-01-05', true, '');

-- Week 2: January 12, 2025
INSERT INTO attendance (child_id, sunday_date, present, notes) VALUES
((SELECT id FROM children WHERE name = 'John Smith'), '2025-01-12', true, ''),
((SELECT id FROM children WHERE name = 'Sarah Johnson'), '2025-01-12', false, 'Out of town'),
((SELECT id FROM children WHERE name = 'Emma Davis'), '2025-01-12', true, ''),
((SELECT id FROM children WHERE name = 'Noah Wilson'), '2025-01-12', true, ''),
((SELECT id FROM children WHERE name = 'Olivia Brown'), '2025-01-12', true, '');

-- Week 3: January 19, 2025
INSERT INTO attendance (child_id, sunday_date, present, notes) VALUES
((SELECT id FROM children WHERE name = 'John Smith'), '2025-01-19', true, ''),
((SELECT id FROM children WHERE name = 'Sarah Johnson'), '2025-01-19', true, ''),
((SELECT id FROM children WHERE name = 'Emma Davis'), '2025-01-19', true, ''),
((SELECT id FROM children WHERE name = 'Noah Wilson'), '2025-01-19', false, 'Excused'),
((SELECT id FROM children WHERE name = 'Olivia Brown'), '2025-01-19', true, '');

-- Week 4: January 26, 2025
INSERT INTO attendance (child_id, sunday_date, present, notes) VALUES
((SELECT id FROM children WHERE name = 'John Smith'), '2025-01-26', true, ''),
((SELECT id FROM children WHERE name = 'Sarah Johnson'), '2025-01-26', true, ''),
((SELECT id FROM children WHERE name = 'Emma Davis'), '2025-01-26', true, ''),
((SELECT id FROM children WHERE name = 'Noah Wilson'), '2025-01-26', true, ''),
((SELECT id FROM children WHERE name = 'Olivia Brown'), '2025-01-26', false, 'Sick');
```

### Insert Sample Offerings
```sql
INSERT INTO offerings (sunday_date, amount, notes) VALUES
('2025-01-05', 145.50, 'Regular collection'),
('2025-01-12', 189.75, 'Regular collection'),
('2025-01-19', 156.25, 'Regular collection + special project'),
('2025-01-26', 123.00, 'Regular collection');
```

---

## Read Queries (SELECT)

### Get All Children
```sql
SELECT 
  id,
  name,
  guardian_name,
  date_of_birth,
  email,
  phone,
  created_at
FROM children
ORDER BY name ASC;
```

### Get Attendance for Specific Date
```sql
SELECT 
  a.id,
  c.name,
  c.guardian_name,
  a.sunday_date,
  a.present,
  a.notes,
  a.created_at
FROM attendance a
JOIN children c ON a.child_id = c.id
WHERE a.sunday_date = '2025-01-12'
ORDER BY c.name ASC;
```

### Get Attendance for Specific Child
```sql
SELECT 
  a.sunday_date,
  a.present,
  a.notes,
  a.created_at
FROM attendance a
WHERE a.child_id = (SELECT id FROM children WHERE name = 'John Smith')
ORDER BY a.sunday_date DESC;
```

### Get Monthly Attendance Summary
```sql
SELECT 
  c.name,
  COUNT(*) FILTER (WHERE a.present = true) as present_days,
  COUNT(*) FILTER (WHERE a.present = false) as absent_days,
  COUNT(*) as total_sundays,
  ROUND(100.0 * COUNT(*) FILTER (WHERE a.present = true) / COUNT(*), 1) as attendance_pct
FROM children c
LEFT JOIN attendance a ON c.id = a.child_id
  AND a.sunday_date >= '2025-01-01'
  AND a.sunday_date <= '2025-01-31'
GROUP BY c.id, c.name
ORDER BY attendance_pct DESC, c.name ASC;
```

### Get Offering Summary for Month
```sql
SELECT 
  SUM(amount) as total_offering,
  AVG(amount) as average_per_sunday,
  MIN(amount) as lowest_sunday,
  MAX(amount) as highest_sunday,
  COUNT(*) as sundays_collected
FROM offerings
WHERE sunday_date >= '2025-01-01'
  AND sunday_date <= '2025-01-31';
```

### Get Offering Records with Details
```sql
SELECT 
  sunday_date,
  amount,
  notes,
  created_at
FROM offerings
WHERE sunday_date >= '2025-01-01'
  AND sunday_date <= '2025-01-31'
ORDER BY sunday_date DESC;
```

### Get Attendance Rate for Each Child (All Time)
```sql
SELECT 
  c.name,
  COUNT(*) as total_sundays,
  COUNT(*) FILTER (WHERE a.present = true) as present_count,
  COUNT(*) FILTER (WHERE a.present = false) as absent_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE a.present = true) / COUNT(*), 1) as attendance_pct
FROM children c
LEFT JOIN attendance a ON c.id = a.child_id
GROUP BY c.id, c.name
ORDER BY attendance_pct DESC;
```

### Get Children with Low Attendance (< 50%)
```sql
SELECT 
  c.name,
  c.guardian_name,
  COUNT(*) as total_sundays,
  COUNT(*) FILTER (WHERE a.present = true) as present_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE a.present = true) / COUNT(*), 1) as attendance_pct
FROM children c
LEFT JOIN attendance a ON c.id = a.child_id
GROUP BY c.id, c.name
HAVING ROUND(100.0 * COUNT(*) FILTER (WHERE a.present = true) / COUNT(*), 1) < 50
ORDER BY attendance_pct ASC;
```

---

## Write Queries (INSERT, UPDATE, DELETE)

### Add a New Child
```sql
INSERT INTO children (name, guardian_name, date_of_birth, email, phone)
VALUES ('Michael Garcia', 'Carlos Garcia', '2018-08-20', 'michael.g@email.com', '555-0201')
RETURNING id, name, created_at;
```

### Mark Child Present for Sunday
```sql
INSERT INTO attendance (child_id, sunday_date, present)
VALUES (
  (SELECT id FROM children WHERE name = 'John Smith'),
  '2025-02-02',
  true
)
ON CONFLICT (child_id, sunday_date) 
DO UPDATE SET present = true
RETURNING *;
```

### Mark Child Absent for Sunday
```sql
INSERT INTO attendance (child_id, sunday_date, present, notes)
VALUES (
  (SELECT id FROM children WHERE name = 'Sarah Johnson'),
  '2025-02-02',
  false,
  'Visiting grandparents'
)
ON CONFLICT (child_id, sunday_date) 
DO UPDATE SET present = false, notes = 'Visiting grandparents'
RETURNING *;
```

### Update Offering for Sunday
```sql
INSERT INTO offerings (sunday_date, amount, notes)
VALUES ('2025-02-02', 167.89, 'Regular collection')
ON CONFLICT (sunday_date)
DO UPDATE SET amount = 167.89, notes = 'Regular collection'
RETURNING *;
```

### Update Child Information
```sql
UPDATE children
SET 
  email = 'newemail@domain.com',
  phone = '555-0999',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'John Smith'
RETURNING *;
```

### Add Note to Attendance Record
```sql
UPDATE attendance
SET notes = 'Excused absence - Doctor appointment'
WHERE child_id = (SELECT id FROM children WHERE name = 'Emma Davis')
  AND sunday_date = '2025-01-19'
RETURNING *;
```

### Delete Old Attendance Records (Archive Before Deleting)
```sql
DELETE FROM attendance
WHERE sunday_date < '2024-01-01'
RETURNING COUNT(*);
```

### Remove a Child (Cascades to Attendance)
```sql
DELETE FROM children
WHERE name = 'Michael Garcia'
RETURNING *;
```

---

## Monthly Aggregation Query (Used in Reports)

### Complete Monthly Report Query
```sql
WITH monthly_stats AS (
  SELECT
    c.id,
    c.name,
    c.guardian_name,
    COUNT(*) as total_sundays,
    COUNT(*) FILTER (WHERE a.present = true) as present_days,
    COUNT(*) FILTER (WHERE a.present = false) as absent_days,
    ROUND(100.0 * COUNT(*) FILTER (WHERE a.present = true) / 
      NULLIF(COUNT(*), 0), 1) as attendance_pct
  FROM children c
  LEFT JOIN attendance a ON c.id = a.child_id
    AND a.sunday_date >= '2025-01-01'
    AND a.sunday_date <= '2025-01-31'
  GROUP BY c.id, c.name, c.guardian_name
),
offerings_stats AS (
  SELECT
    SUM(amount) as total_offering,
    AVG(amount) as avg_offering,
    COUNT(*) as weeks_collected
  FROM offerings
  WHERE sunday_date >= '2025-01-01'
    AND sunday_date <= '2025-01-31'
)
SELECT
  (SELECT * FROM monthly_stats ORDER BY name) as children_stats,
  (SELECT * FROM offerings_stats) as offerings_stats;
```

---

## Performance Optimization Tips

### Enable Query Statistics
```sql
ANALYZE children;
ANALYZE attendance;
ANALYZE offerings;
```

### Check Index Usage
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### List Slow Queries (Supabase's Slow Queries View)
```sql
-- View in Supabase UI: Logs → Query Performance
```

---

## Data Backup & Export

### Export All Data to CSV-like Format
```sql
-- Children
COPY (
  SELECT id, name, guardian_name, date_of_birth, email, phone, created_at
  FROM children
  ORDER BY name
) TO STDOUT WITH CSV HEADER;

-- Attendance
COPY (
  SELECT a.id, c.name, a.sunday_date, a.present, a.notes, a.created_at
  FROM attendance a
  JOIN children c ON a.child_id = c.id
  ORDER BY a.sunday_date DESC, c.name
) TO STDOUT WITH CSV HEADER;

-- Offerings
COPY (
  SELECT sunday_date, amount, notes, created_at
  FROM offerings
  ORDER BY sunday_date DESC
) TO STDOUT WITH CSV HEADER;
```

---

## Row Level Security Examples (For Admin-Only Access)

### Enable RLS on Tables
```sql
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
```

### Create Admin-Only Policy
```sql
-- Create admin role (optional)
CREATE ROLE admin NOINHERIT;

-- Policy: Only authenticated users can access
CREATE POLICY "auth_users_access"
ON children FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "auth_users_access"
ON attendance FOR SELECT
USING (auth.role() = 'authenticated');
```

---

## Common Tasks

### Task: Print Report for May 2025
```sql
SELECT 
  c.name,
  COUNT(*) FILTER (WHERE a.present = true) as present,
  COUNT(*) FILTER (WHERE a.present = false) as absent,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE a.present = true) / COUNT(*), 1) as pct
FROM children c
LEFT JOIN attendance a ON c.id = a.child_id
WHERE EXTRACT(YEAR FROM a.sunday_date) = 2025
  AND EXTRACT(MONTH FROM a.sunday_date) = 5
GROUP BY c.id, c.name
ORDER BY c.name;
```

### Task: Find Most Frequent Attendee (2025)
```sql
SELECT 
  c.name,
  COUNT(*) FILTER (WHERE a.present = true) as sundays_present,
  COUNT(*) as total_sundays,
  ROUND(100.0 * COUNT(*) FILTER (WHERE a.present = true) / COUNT(*), 1) as attendance_pct
FROM children c
LEFT JOIN attendance a ON c.id = a.child_id
WHERE EXTRACT(YEAR FROM a.sunday_date) = 2025
GROUP BY c.id, c.name
ORDER BY attendance_pct DESC
LIMIT 1;
```

### Task: Total Offering Year-to-Date
```sql
SELECT 
  SUM(amount) as ytd_total,
  AVG(amount) as avg_sunday,
  COUNT(*) as sundays,
  EXTRACT(YEAR FROM sunday_date) as year
FROM offerings
WHERE EXTRACT(YEAR FROM sunday_date) = 2025
GROUP BY EXTRACT(YEAR FROM sunday_date);
```

---

For more help, contact Supabase support or check the documentation at https://supabase.com/docs

