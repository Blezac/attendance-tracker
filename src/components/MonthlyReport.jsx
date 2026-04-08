import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

export default function MonthlyReport({ currentDate, children, onDateChange, attendanceRecords }) {
  const [monthlyStats, setMonthlyStats] = useState(null)
  const [totalOffering, setTotalOffering] = useState(0)

  useEffect(() => {
    calculateMonthlyStats()
  }, [currentDate, attendanceRecords, children])

  const calculateMonthlyStats = async () => {
    try {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)

      // Get all Sundays in the month
      const sundays = eachDayOfInterval({ start: monthStart, end: monthEnd }).filter(day => day.getDay() === 0)

      // Calculate stats for each child
      const stats = {}
      children.forEach(child => {
        const childRecords = attendanceRecords.filter(r => r.child_id === child.id)
        const present = childRecords.filter(r => r.present).length
        const absent = childRecords.filter(r => !r.present).length
        const total = sundays.length

        stats[child.id] = {
          name: child.name,
          present,
          absent,
          total,
          attendanceRate: total > 0 ? ((present / total) * 100).toFixed(1) : 0
        }
      })

      setMonthlyStats(stats)

      // Fetch total offering for the month
      const { data, error } = await supabase
        .from('offerings')
        .select('amount')
        .gte('sunday_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('sunday_date', format(monthEnd, 'yyyy-MM-dd'))

      if (!error && data) {
        const total = data.reduce((sum, row) => sum + (row.amount || 0), 0)
        setTotalOffering(total)
      }
    } catch (error) {
      console.error('Error calculating stats:', error.message)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!monthlyStats) {
    return <div>Loading monthly report...</div>
  }

  return (
    <div className="monthly-report">
      <div className="report-header">
        <h2>Monthly Report - {format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={handlePrint} className="btn-print">🖨️ Print</button>
      </div>

      <div className="report-summary">
        <div className="summary-card">
          <h3>Total Offering</h3>
          <p className="summary-value">₦{totalOffering.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Active Children</h3>
          <p className="summary-value">{children.length}</p>
        </div>
      </div>

      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Child Name</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Total Sundays</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(monthlyStats)
              .sort((a, b) => a[1].name.localeCompare(b[1].name))
              .map(([_, stats]) => (
                <tr key={stats.name}>
                  <td className="child-name-cell">{stats.name}</td>
                  <td className="present-cell">{stats.present}</td>
                  <td className="absent-cell">{stats.absent}</td>
                  <td className="total-cell">{stats.total}</td>
                  <td className="rate-cell">
                    <span className={`rate-badge ${stats.attendanceRate >= 75 ? 'high' : 'low'}`}>
                      {stats.attendanceRate}%
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="report-footer">
        <p>Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
      </div>
    </div>
  )
}
