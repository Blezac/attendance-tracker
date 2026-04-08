import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AddChildForm({ onChildAdded }) {
  const [name, setName] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setMessage('❌ Please enter child name')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('children')
        .insert({
          name: name.trim(),
          guardian_name: guardianName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null
        })

      if (error) throw error

      setMessage('✅ Child added successfully!')
      setName('')
      setGuardianName('')
      setEmail('')
      setPhone('')
      
      // Call parent function to refresh children list
      if (onChildAdded) {
        setTimeout(() => onChildAdded(), 500)
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="add-child-form">
      <h2>Add New Child</h2>
      
      <form onSubmit={handleSubmit} className="child-form">
        <div className="form-group">
          <label htmlFor="name">Child Name *</label>
          <input
            id="name"
            type="text"
            placeholder="e.g., Joshua Olawale"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="guardian">Guardian Name</label>
          <input
            id="guardian"
            type="text"
            placeholder="e.g., Mrs. Olawale"
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email (optional)</label>
          <input
            id="email"
            type="email"
            placeholder="guardian@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            type="tel"
            placeholder="+234 123 456 7890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={saving}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="submit-btn"
        >
          {saving ? '⏳ Saving...' : '✅ Add Child'}
        </button>
      </form>

      {message && (
        <div className={`form-message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="form-instructions">
        <p><strong>All fields except Name are optional.</strong></p>
        <p>You can update information later by editing the Supabase database directly.</p>
      </div>
    </div>
  )
}
