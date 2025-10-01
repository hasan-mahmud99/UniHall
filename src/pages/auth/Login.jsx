import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@nstu.edu.bd')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    try {
  const u = await login(email, password)
  const dest = u.role === 'admin' ? '/admin' : u.role === 'examcontroller' ? '/exam' : u.role === 'staff' ? '/staff' : '/student'
  nav(dest)
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <div className="max-w-md mx-auto bg-white border rounded p-6">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <form onSubmit={submit} className="grid gap-3">
        <input className="border rounded px-3 py-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="px-4 py-2 bg-brand-600 text-white rounded">Login</button>
      </form>
    </div>
  )
}
