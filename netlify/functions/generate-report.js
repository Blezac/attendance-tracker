// Netlify Function Example - For future serverless capabilities
// Place in netlify/functions/ directory

// netlify/functions/generate-report.js
// Builds monthly reports server-side

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service key for server-side
)

export const handler = async (event) => {
  try {
    const { month } = JSON.parse(event.body)
    
    if (!month) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Month parameter required' })
      }
    }

    // Parse month (e.g., "2025-01")
    const [year, monthStr] = month.split('-')
    const startDate = `${year}-${monthStr}-01`
    const endDate = `${year}-${monthStr}-31`

    // Query attendance
    const { data: attendance, error: attendanceErr } = await supabase
      .from('attendance')
      .select('*, children(name)')
      .gte('sunday_date', startDate)
      .lte('sunday_date', endDate)

    if (attendanceErr) throw attendanceErr

    // Query offerings
    const { data: offerings, error: offeringsErr } = await supabase
      .from('offerings')
      .select('*')
      .gte('sunday_date', startDate)
      .lte('sunday_date', endDate)

    if (offeringsErr) throw offeringsErr

    // Calculate stats
    const stats = processAttendanceData(attendance, offerings)

    // Store in database (optional)
    const { error: saveErr } = await supabase
      .from('monthly_reports')
      .insert({
        report_month: startDate,
        report_data: stats
      })

    if (saveErr) console.warn('Could not save report:', saveErr)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}

function processAttendanceData(attendance, offerings) {
  // Group by child
  const childStats = {}
  
  attendance.forEach(record => {
    if (!childStats[record.child_id]) {
      childStats[record.child_id] = {
        name: record.children?.name,
        present: 0,
        absent: 0
      }
    }
    
    if (record.present) {
      childStats[record.child_id].present++
    } else {
      childStats[record.child_id].absent++
    }
  })

  // Calculate percentages
  Object.values(childStats).forEach(stats => {
    const total = stats.present + stats.absent
    stats.attendance_pct = total > 0 ? ((stats.present / total) * 100).toFixed(1) : 0
  })

  // Offering totals
  const totalOffering = offerings.reduce((sum, o) => sum + (o.amount || 0), 0)
  const avgOffering = offerings.length > 0 ? (totalOffering / offerings.length).toFixed(2) : 0

  return {
    children: childStats,
    offering: {
      total: totalOffering.toFixed(2),
      average: avgOffering,
      weeks: offerings.length
    }
  }
}
