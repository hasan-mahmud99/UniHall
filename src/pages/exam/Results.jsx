import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

export default function Results() {
  const { user } = useAuth()
  const hallId = user?.hallId
  const [name, setName] = useState('Result Sheet')
  const [content, setContent] = useState('')
  const list = api.listResults({ hallId })
  const submit = (e) => {
    e.preventDefault()
    api.createResultUpload({ hallId, name, content })
    setContent('')
  }
  return (
    <div className="grid gap-4">
      <form onSubmit={submit} className="bg-white border rounded p-4 grid gap-2">
        <h2 className="text-lg font-semibold">Upload Results</h2>
        <input className="border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
        <textarea className="border rounded px-3 py-2" placeholder="Paste CSV or text" rows={6} value={content} onChange={e => setContent(e.target.value)} />
        <button className="px-4 py-2 bg-brand-600 text-white rounded w-max">Save</button>
      </form>
      <div className="bg-white border rounded p-4">
        <h3 className="font-medium mb-2">Uploaded</h3>
        <ul className="text-sm list-disc pl-5">
          {list.map(i => <li key={i.id}>{i.name} – {new Date(i.createdAt).toLocaleString()}</li>)}
        </ul>
      </div>
    </div>
  )
}
