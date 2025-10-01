import React from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

export default function StaffDashboard() {
  const { user } = useAuth()
  const hallId = user?.hallId
  // Complaints are not hall-scoped in our mock; list all for now
  const complaints = api.listComplaints()
  const update = (id, status) => { api.updateComplaintStatus(id, status); window.location.reload() }
  return (
    <div className="grid gap-6">
      <div className="bg-white border rounded p-4">
        <h2 className="text-lg font-semibold">Complaints</h2>
        {complaints.length === 0 ? <p className="text-sm text-gray-600">No complaints.</p> : (
          <ul className="text-sm grid gap-2">
            {complaints.map(c => (
              <li key={c.id} className="border rounded p-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-gray-600">{c.body}</div>
                </div>
                <div className="flex gap-2">
                  {['Open','In Progress','Resolved','Closed'].map(s => (
                    <button key={s} className="px-2 py-1 border rounded" onClick={() => update(c.id, s)}>{s}</button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
