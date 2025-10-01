import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

export default function Notifications() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const hallId = user?.hallId
  const list = api.listNotifications({ hallId })
  const canAdmin = user?.role === 'admin'

  const submit = (e) => {
    e.preventDefault()
    api.createNotification(title, body, hallId)
    setTitle(''); setBody('')
    window.location.reload()
  }

  return (
    <div className="grid gap-6">
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Notifications</h2>
        <ul className="text-sm list-disc pl-5">
          {list.map(n => <li key={n.id}><span className="font-medium">{n.title}</span> – {n.body}</li>)}
        </ul>
      </div>
      {canAdmin && (
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-2">Post Notification</h2>
          <form onSubmit={submit} className="grid gap-2 max-w-lg">
            <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="border rounded px-3 py-2" rows={3} placeholder="Body" value={body} onChange={e => setBody(e.target.value)} />
            <button className="px-4 py-2 bg-brand-600 text-white rounded w-max">Publish</button>
          </form>
        </div>
      )}
    </div>
  )
}
