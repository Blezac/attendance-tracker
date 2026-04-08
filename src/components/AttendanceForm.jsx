import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { format, addDays, subDays } from 'date-fns'

export default function AttendanceForm({
  currentDate,
  onDateChange,
  children,
  attendanceRecords,
  onRefresh,
  isLastSunday
}) {
  const [offering, setOffering] = useState('')
  const [attendance, setAttendance] = useState({})
  const [saving, setSaving] = useState(false)

  // Initialize attendance from records
  React.useEffect(() => {
    const newAttendance = {}
    children.forEach(child => {
      const record = attendanceRecords.find(r => r.child_id === child.id && r.sunday_date === format(currentDate, 'yyyy-MM-dd'))
      newAttendance[child.id] = record ? record.present : null
    })
    setAttendance(newAttendance)
  }, [children, attendanceRecords, currentDate])

  const handleAttendanceToggle = (childId) => {
    setAttendance(prev => ({
      ...prev,
      [childId]: prev[childId] === null ? true : prev[childId] === true ? false : null
    }))
  }

  const handleSaveAttendance = async () => {
    setSaving(true)
    try {
      const sundayDate = format(currentDate, 'yyyy-MM-dd')
      
      // Delete existing records for this date
      await supabase
        .from('attendance')
        .delete()
        .eq('sunday_date', sundayDate)

      // Insert new records
      const recordsToInsert = Object.entries(attendance)
        .filter(([_, present]) => present !== null)
        .map(([childId, present]) => ({
          child_id: childId,
          sunday_date: sundayDate,
          present
        }))

      if (recordsToInsert.length > 0) {
        const { error } = await supabase.from('attendance').insert(recordsToInsert)
        if (error) throw error
      }

      // Save offering if provided
      if (offering) {
        await supabase.from('offerings').upsert(
          {
            sunday_date: sundayDate,
            amount: parseFloat(offering)
          },
          { onConflict: 'sunday_date' }
        )
      }

      onRefresh()
      alert('✓ Attendance and offering saved successfully!')
    } catch (error) {
      alert('Error saving: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const presentCount = Object.values(attendance).filter(v => v === true).length
  const absentCount = Object.values(attendance).filter(v => v === false).length

  return (
    <div className="attendance-form">
      <div className="date-picker">
        <button onClick={() => onDateChange(subDays(currentDate, 7))}>← Previous Sunday</button>
        <span className="current-date">{format(currentDate, 'MMMM d, yyyy')}</span>
        <button onClick={() => onDateChange(addDays(currentDate, 7))}>Next Sunday →</button>
      </div>

      <div className="stats-summary">
        <div className="stat present">
          <span className="label">Present</span>
          <span className="count">{presentCount}</span>
        </div>
        <div className="stat absent">
          <span className="label">Absent</span>
          <span className="count">{absentCount}</span>
        </div>
        <div className="stat total">
          <span className="label">Total</span>
          <span className="count">{presentCount + absentCount}</span>
        </div>
      </div>

      <form className="attendance-list">
        <h3>Mark Attendance</h3>
        <div className="children-grid">
          {children.map(child => (
            <div key={child.id} className="attendance-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={attendance[child.id] === true}
                  onChange={() => handleAttendanceToggle(child.id)}
                  className="checkbox-input"
                />
                <span className={`child-name ${attendance[child.id] === true ? 'present' : attendance[child.id] === false ? 'absent' : ''}`}>
                  {child.name}
                </span>
              </label>
              {attendance[child.id] && (
                <button
                  type="button"
                  className="mark-absent-btn"
                  onClick={() => handleAttendanceToggle(child.id)}
                >
                  ✓ Present
                </button>
              )}
            </div>
          ))}
        </div>
      </form>

      <div className="offering-section">
        <label htmlFor="offering">Total Offering for Sunday (optional)</label>
        <div className="offering-input-group">
          <span className="currency">₦</span>
          <input
            id="offering"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={offering}
            onChange={e => setOffering(e.target.value)}
            className="offering-input"
          />
        </div>
      </div>

      <div className="action-buttons">
        <button
          onClick={handleSaveAttendance}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : '💾 Save Attendance & Offering'}
        </button>

        {isLastSunday && (
          <button className="btn-secondary">
            📊 Generate Monthly Report
          </button>
        )}
      </div>
    </div>
  )
}
