import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { format, startOfMonth, endOfMonth, lastDayOfMonth, isSunday } from 'date-fns'
import AttendanceForm from './components/AttendanceForm'
import MonthlyReport from './components/MonthlyReport'
import AddChildForm from './components/AddChildForm'
import './index.css'

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [children, setChildren] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [view, setView] = useState('attendance') // 'attendance', 'report', or 'add-child'
  const [loading, setLoading] = useState(false)

  // Fetch all children
  useEffect(() => {
    fetchChildren()
  }, [])

  // Fetch attendance records for current Sunday
  useEffect(() => {
    if (isSunday(currentDate) || view === 'report') {
      fetchAttendanceRecords()
    }
  }, [currentDate, view])

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('name')

      if (error) throw error
      setChildren(data || [])
    } catch (error) {
      console.error('Error fetching children:', error.message)
    }
  }

  const fetchAttendanceRecords = async () => {
    try {
      let query = supabase.from('attendance').select('*')
      
      if (view === 'report') {
        // Get all records for the current month
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        query = query
          .gte('sunday_date', format(monthStart, 'yyyy-MM-dd'))
          .lte('sunday_date', format(monthEnd, 'yyyy-MM-dd'))
      } else {
        // Get records for current Sunday only
        query = query.eq('sunday_date', format(currentDate, 'yyyy-MM-dd'))
      }

      const { data, error } = await query

      if (error) throw error
      setAttendanceRecords(data || [])
    } catch (error) {
      console.error('Error fetching attendance:', error.message)
    }
  }

  const handleDateChange = (date) => {
    setCurrentDate(date)
  }

  const isLastSundayOfMonth = () => {
    const lastDay = lastDayOfMonth(currentDate)
    const lastSunday = new Date(lastDay)
    
    while (lastSunday.getDay() !== 0) {
      lastSunday.setDate(lastSunday.getDate() - 1)
    }
    
    return format(currentDate, 'yyyy-MM-dd') === format(lastSunday, 'yyyy-MM-dd')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>⛪ Church Children's Department</h1>
        <p>Sunday Attendance & Offerings Tracker</p>
      </header>

      <nav className="view-selector">
        <button
          className={`nav-btn ${view === 'attendance' ? 'active' : ''}`}
          onClick={() => setView('attendance')}
        >
          Attendance
        </button>
        <button
          className={`nav-btn ${view === 'report' ? 'active' : ''}`}
          onClick={() => setView('report')}
        >
          Monthly Report
        </button>
        <button
          className={`nav-btn ${view === 'add-child' ? 'active' : ''}`}
          onClick={() => setView('add-child')}
        >
          ➕ Add Child
        </button>
      </nav>

      <main className="app-content">
        {view === 'attendance' && (
          <AttendanceForm
            currentDate={currentDate}
            onDateChange={handleDateChange}
            children={children}
            attendanceRecords={attendanceRecords}
            onRefresh={fetchAttendanceRecords}
            isLastSunday={isLastSundayOfMonth()}
          />
        )}

        {view === 'report' && (
          <MonthlyReport
            currentDate={currentDate}
            onDateChange={handleDateChange}
            attendanceRecords={attendanceRecords}
            children={children}
          />
        )}

        {view === 'add-child' && (
          <AddChildForm onChildAdded={fetchChildren} />
        )}
      </main>
    </div>
  )
}
