import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

export default function Complaints() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const mine = user ? api.listComplaints({ userId: user.id }) : []
  const all = api.listComplaints()
  const canAdmin = user?.role === 'admin'

  const submit = (e) => {
    e.preventDefault()
    if (!user) return alert('Login required')
    api.createComplaint({ userId: user.id, title, body })
    setTitle(''); setBody('')
    window.location.reload()
  }
  const update = (id, status) => { api.updateComplaintStatus(id, status); window.location.reload() }

  return (
    <div className="grid gap-6">
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Submit a Complaint</h2>
        <form onSubmit={submit} className="grid gap-2 max-w-lg">
          <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="border rounded px-3 py-2" rows={3} placeholder="Details" value={body} onChange={e => setBody(e.target.value)} />
          <button className="px-4 py-2 bg-brand-600 text-white rounded w-max">Submit</button>
        </form>
      </div>
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">My Complaints</h2>
        {mine.length === 0 ? <p className="text-sm text-gray-600">No complaints yet.</p> : (
          <ul className="text-sm list-disc pl-5">
            {mine.map(c => <li key={c.id}>{c.title} – <span className="font-medium">{c.status}</span></li>)}
          </ul>
        )}
      </div>
      {canAdmin && (
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-2">All Complaints (Admin)</h2>
          {all.length === 0 ? <p className="text-sm text-gray-600">No complaints.</p> : (
            <ul className="text-sm grid gap-2">
              {all.map(c => (
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
      )}
    </div>
  )
}
