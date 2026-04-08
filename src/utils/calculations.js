// Utility functions for attendance calculations
import { eachDayOfInterval, startOfMonth, endOfMonth, format } from 'date-fns'

/**
 * Get all Sundays in a given month
 * @param {Date} date - Any date in the target month
 * @returns {Array<Date>} Array of Sunday dates
 */
export const getSundaysInMonth = (date) => {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return eachDayOfInterval({ start, end }).filter(day => day.getDay() === 0)
}

/**
 * Calculate attendance statistics for a single child
 * @param {Array} records - Attendance records for the child
 * @param {number} totalSundays - Total Sundays in period
 * @returns {Object} Stats object
 */
export const calculateChildStats = (records, totalSundays) => {
  const present = records.filter(r => r.present).length
  const absent = records.filter(r => !r.present).length
  const attendanceRate = totalSundays > 0 
    ? ((present / totalSundays) * 100).toFixed(1)
    : 0

  return {
    present,
    absent,
    total: totalSundays,
    attendanceRate: parseFloat(attendanceRate)
  }
}

/**
 * Calculate monthly statistics for all children
 * @param {Array} children - List of all children
 * @param {Array} attendanceRecords - All attendance records for month
 * @param {Date} date - Month to calculate for
 * @returns {Object} Monthly statistics by child ID
 */
export const calculateMonthlyStats = (children, attendanceRecords, date) => {
  const sundays = getSundaysInMonth(date)
  const totalSundays = sundays.length

  const stats = {}

  children.forEach(child => {
    const childRecords = attendanceRecords.filter(r => r.child_id === child.id)
    stats[child.id] = {
      name: child.name,
      ...calculateChildStats(childRecords, totalSundays)
    }
  })

  return stats
}

/**
 * Calculate total offerings for a period
 * @param {Array} offerings - Offering records
 * @returns {Object} Offering statistics
 */
export const calculateOfferingStats = (offerings) => {
  if (!offerings || offerings.length === 0) {
    return {
      total: 0,
      average: 0,
      count: 0
    }
  }

  const total = offerings.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0)
  
  return {
    total: parseFloat(total.toFixed(2)),
    average: parseFloat((total / offerings.length).toFixed(2)),
    count: offerings.length
  }
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDisplayDate = (date) => {
  return format(date, 'EEEE, MMMM d, yyyy')
}

/**
 * Format date for database
 * @param {Date} date - Date to format
 * @returns {string} YYYY-MM-DD format
 */
export const formatDatabaseDate = (date) => {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Get color class for attendance rate
 * @param {number} rate - Attendance percentage (0-100)
 * @returns {string} CSS class name
 */
export const getAttendanceColorClass = (rate) => {
  if (rate >= 80) return 'high'
  if (rate >= 50) return 'medium'
  return 'low'
}

/**
 * Check if a given date is the last Sunday of its month
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export const isLastSundayOfMonth = (date) => {
  const monthEnd = endOfMonth(date)
  const sundays = getSundaysInMonth(date)
  
  if (sundays.length === 0) return false
  
  const lastSunday = sundays[sundays.length - 1]
  return format(date, 'yyyy-MM-dd') === format(lastSunday, 'yyyy-MM-dd')
}

/**
 * Generate attendance report for a child for a time period
 * @param {Object} child - Child object
 * @param {Array} records - Attendance records for child
 * @param {Date} startDate - Start of period
 * @param {Date} endDate - End of period
 * @returns {Object} Report data
 */
export const generateChildReport = (child, records, startDate, endDate) => {
  const sundays = getSundaysInMonth(startDate) // Or use interval-based filter
  const stats = calculateChildStats(records, sundays.length)

  return {
    childId: child.id,
    childName: child.name,
    guardianName: child.guardian_name,
    period: `${format(startDate, 'MMM yyyy')}`,
    ...stats,
    records: records.map(r => ({
      date: r.sunday_date,
      status: r.present ? 'Present' : 'Absent',
      notes: r.notes
    }))
  }
}

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects
 * @param {Array} headers - Column headers
 * @returns {string} CSV string
 */
export const convertToCSV = (data, headers) => {
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header]
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return value
    }).join(','))
  ].join('\n')

  return csv
}

/**
 * Generate printable HTML for report
 * @param {Object} reportData - Report data
 * @returns {string} HTML string
 */
export const generatePrintableHTML = (reportData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Attendance Report</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 2rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 0.75rem; text-align: left; }
        th { background-color: #667eea; color: white; }
        .footer { text-align: center; margin-top: 2rem; color: #666; }
      </style>
    </head>
    <body>
      ${reportData}
      <div class="footer">
        <p>Generated on ${format(new Date(), 'MMMM d, yyyy HH:mm')}</p>
      </div>
    </body>
    </html>
  `
}
