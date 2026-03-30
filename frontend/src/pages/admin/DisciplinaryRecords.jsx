import React, { useState, useEffect } from 'react'
import api from '../../lib/apiClient'

const severityStyles = {
  Minor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Major: 'bg-orange-100 text-orange-800 border-orange-200',
  Severe: 'bg-red-100 text-red-800 border-red-200'
}

const formatDate = (isoString) => {
  if (!isoString) return 'N/A'
  const date = new Date(isoString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const emptyForm = {
  studentId: '',
  studentName: '',
  title: '',
  severity: 'Minor',
  actionTaken: '',
  details: '',
  incidentDate: new Date().toISOString().split('T')[0]
}

export default function DisciplinaryRecords() {
  const [records, setRecords] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchStudentId, setSearchStudentId] = useState('')
  const [appliedStudentId, setAppliedStudentId] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [studentSuggestions, setStudentSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Fetch records on component mount
  useEffect(() => {
    fetchRecords()
  }, [])

  // Live search suggestions for the top search bar (debounced)
  useEffect(() => {
    const q = String(searchStudentId || '').trim()
    if (q.length < 1) {
      setSearchSuggestions([])
      setShowSearchSuggestions(false)
      return
    }

    const timer = window.setTimeout(async () => {
      try {
        const response = await api.get(`/disciplinary-records/search/students?q=${encodeURIComponent(q)}`)
        setSearchSuggestions(response.data.data || [])
        setShowSearchSuggestions(true)
      } catch (err) {
        console.error('Error searching students:', err)
        setSearchSuggestions([])
        setShowSearchSuggestions(false)
      }
    }, 250)

    return () => window.clearTimeout(timer)
  }, [searchStudentId])

  const fetchRecords = async ({ studentId } = {}) => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (studentId) params.studentId = studentId
      const response = await api.get('/disciplinary-records', {
        params: Object.keys(params).length ? params : undefined
      })
      setRecords(response.data.data || [])
    } catch (err) {
      console.error('Error fetching records:', err)
      setError('Failed to load disciplinary records')
    } finally {
      setLoading(false)
    }
  }

  const submitSearch = async (event) => {
    event?.preventDefault?.()
    const normalized = String(searchStudentId || '').trim()
    setAppliedStudentId(normalized)
    setShowSearchSuggestions(false)
    await fetchRecords({ studentId: normalized || undefined })
  }

  const clearSearch = async () => {
    setSearchStudentId('')
    setAppliedStudentId('')
    setSearchSuggestions([])
    setShowSearchSuggestions(false)
    await fetchRecords()
  }

  const selectSearchStudent = async (student) => {
    const id = student?.universityId || student?.userId || ''
    setSearchStudentId(id)
    setShowSearchSuggestions(false)
    await fetchRecords({ studentId: String(id).trim() || undefined })
    setAppliedStudentId(String(id).trim())
  }

  const handleStudentSearch = async (query) => {
    setForm(prev => ({ ...prev, studentId: query }))
    
    if (query.length < 1) {
      setStudentSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await api.get(`/disciplinary-records/search/students?q=${encodeURIComponent(query)}`)
      setStudentSuggestions(response.data.data || [])
      setShowSuggestions(true)
    } catch (err) {
      console.error('Error searching students:', err)
      setStudentSuggestions([])
    }
  }

  const selectStudent = (student) => {
    setForm(prev => ({
      ...prev,
      studentId: student.universityId || student.userId,
      studentName: student.name || ''
    }))
    setShowSuggestions(false)
  }

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const openEditForm = (record) => {
    setEditingId(record.recordId)
    setForm({
      studentId: record.studentUniversityId || record.studentId,
      studentName: record.studentName || '',
      title: record.title,
      severity: record.severity,
      actionTaken: record.actionTaken,
      details: record.details,
      incidentDate: record.incidentDate ? record.incidentDate.split('T')[0] : ''
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!form.studentId || !form.title || !form.actionTaken || !form.details || !form.incidentDate) {
      alert('Please complete all required fields.')
      return
    }

    try {
      setSubmitting(true)
      
      if (editingId) {
        // Update existing record
        const payload = {
          title: form.title,
          severity: form.severity,
          actionTaken: form.actionTaken,
          details: form.details,
          incidentDate: form.incidentDate
        }
        const response = await api.put(`/disciplinary-records/${editingId}`, payload)
        
        if (response.data.success) {
          setForm(emptyForm)
          setEditingId(null)
          setIsFormOpen(false)
          await fetchRecords()
          alert('Disciplinary record updated successfully!')
        }
      } else {
        // Create new record
        const payload = {
          studentId: form.studentId,
          title: form.title,
          severity: form.severity,
          actionTaken: form.actionTaken,
          details: form.details,
          incidentDate: form.incidentDate
        }

        const response = await api.post('/disciplinary-records', payload)
        
        if (response.data.success) {
          setForm(emptyForm)
          setIsFormOpen(false)
          await fetchRecords()
          alert('Disciplinary record added successfully!')
        }
      }
    } catch (err) {
      console.error('Error submitting record:', err)
      const errorMsg = err.response?.data?.message || 'Failed to submit record'
      alert(`Error: ${errorMsg}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (recordId) => {
    try {
      const response = await api.delete(`/disciplinary-records/${recordId}`)
      if (response.data.success) {
        setDeleteConfirm(null)
        await fetchRecords()
        alert('Record deleted successfully!')
      }
    } catch (err) {
      console.error('Error deleting record:', err)
      const errorMsg = err.response?.data?.message || 'Failed to delete record'
      alert(`Error: ${errorMsg}`)
    }
  }


  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6" style={{ backgroundColor: '#013A63' }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Disciplinary Records</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setEditingId(null); setForm(emptyForm); setIsFormOpen(true) }}
            className="px-4 py-2 bg-[#2C7DA0]/40 backdrop-blur-md border border-[#2C7DA0]/50 rounded-full text-sm text-white font-medium hover:bg-[#123C69]/60 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Add New
          </button>
        </div>
      </div>

      <form onSubmit={submitSearch} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="relative">
            <label className="block text-sm font-medium text-white mb-1">Search by Student ID</label>
            <input
              value={searchStudentId}
              onChange={(e) => setSearchStudentId(e.target.value)}
              onFocus={() => {
                if (searchSuggestions.length > 0) setShowSearchSuggestions(true)
              }}
              onBlur={() => {
                // allow click on suggestion
                window.setTimeout(() => setShowSearchSuggestions(false), 150)
              }}
              className="w-full border border-white/20 bg-white/10 text-white placeholder:text-white/70 rounded px-3 py-2"
              placeholder="Type ID to see suggestions..."
              autoComplete="off"
            />

            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded shadow-lg border border-gray-200 z-20 overflow-hidden">
                {searchSuggestions.map((student) => (
                  <button
                    key={student.userId}
                    type="button"
                    onClick={() => selectSearchStudent(student)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0"
                  >
                    <div className="font-semibold text-sm text-gray-900">{student.universityId || student.userId}</div>
                    <div className="text-xs text-gray-600">{student.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-white text-[#013A63] rounded font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
            <button
              type="button"
              onClick={clearSearch}
              disabled={loading && !appliedStudentId}
              className="px-4 py-2 border border-white/30 text-white rounded font-medium hover:bg-white/10 disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-white/70">Search works with university ID or internal student ID.</p>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <section className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Record' : 'Add New Record'}</h2>
          {!isFormOpen && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm)
                setIsFormOpen(true)
              }}
              className="px-4 py-2 bg-[#2C7DA0] text-white rounded hover:bg-[#123C69] text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Add New Record
            </button>
          )}
        </div>

        {isFormOpen && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID {editingId ? '(Read-only)' : '*'}</label>
              <input 
                value={form.studentId} 
                onChange={(e) => !editingId && handleStudentSearch(e.target.value)}
                onFocus={() => !editingId && form.studentId && setShowSuggestions(true)}
                disabled={editingId}
                className={`w-full border rounded px-3 py-2 ${editingId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Search by student ID or name..." 
                autoComplete="off"
              />
              {!editingId && showSuggestions && studentSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 shadow-lg z-10">
                  {studentSuggestions.map(student => (
                    <button
                      key={student.userId}
                      type="button"
                      onClick={() => selectStudent(student)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0"
                    >
                      <div className="font-semibold text-sm">{student.universityId}</div>
                      <div className="text-xs text-gray-600">{student.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incident Title *</label>
              <input 
                value={form.title} 
                onChange={handleChange('title')} 
                className="w-full border rounded px-3 py-2" 
                placeholder="e.g., Noise Violation" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date *</label>
              <input 
                type="date"
                value={form.incidentDate} 
                onChange={handleChange('incidentDate')} 
                className="w-full border rounded px-3 py-2" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
              <select value={form.severity} onChange={handleChange('severity')} className="w-full border rounded px-3 py-2">
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken *</label>
              <input 
                value={form.actionTaken} 
                onChange={handleChange('actionTaken')} 
                className="w-full border rounded px-3 py-2" 
                placeholder="e.g., Written warning" 
              />
            </div>
            <div></div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Details *</label>
              <textarea 
                value={form.details} 
                onChange={handleChange('details')} 
                rows={4} 
                className="w-full border rounded px-3 py-2" 
                placeholder="Provide a brief summary of the incident" 
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
              >
                {submitting ? (editingId ? 'Updating...' : 'Recording...') : (editingId ? 'Update Record' : 'Record Incident')}
              </button>
              <button 
                type="button" 
                onClick={() => setForm(emptyForm)} 
                className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
              <button 
                type="button" 
                onClick={() => { setForm(emptyForm); setEditingId(null); setIsFormOpen(false) }} 
                className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="space-y-4">
        {loading ? (
          <div className="text-white text-center py-8">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center text-gray-600">
            {appliedStudentId ? `No disciplinary records found for "${appliedStudentId}"` : 'No disciplinary records found'}
          </div>
        ) : (
          records.map(record => (
            <article key={record.recordId} className="border-2 border-gray-200 rounded-xl p-5 shadow-sm" style={{ backgroundColor: '#2C7DA0' }}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{record.studentUniversityId || record.studentId}</h2>
                  <p className="text-sm text-white">Name: {record.studentName}</p>
                  {record.title && (
                    <p className="text-sm font-bold text-white">Title: {record.title}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityStyles[record.severity] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {record.severity}
                  </span>
                  <span className="text-xs font-bold text-white">Date: {formatDate(record.incidentDate)}</span>
                  <button
                    type="button"
                    onClick={() => openEditForm(record)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(record.recordId)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Action Taken</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{record.actionTaken}</p>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Details</p>
                <p className="text-sm font-bold text-gray-900 mt-1 leading-relaxed">{record.details}</p>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this disciplinary record? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
