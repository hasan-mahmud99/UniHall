import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    try {
      if (password !== confirm) throw new Error('Passwords do not match')
      if (!/^[^@]+@student\.nstu\.edu\.bd$/i.test(email)) throw new Error('Use @student.nstu.edu.bd email')
      api.setPendingRegistration({ studentId })
      await register({ name, email, password })
      api.clearPendingRegistration()
      nav('/student')
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <div className="max-w-md mx-auto bg-white border rounded p-6">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <form onSubmit={submit} className="grid gap-3">
        <input className="border rounded px-3 py-2" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Student ID (e.g., MUHXXXX)" value={studentId} onChange={e => setStudentId(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Email (@student.nstu.edu.bd)" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        <button className="px-4 py-2 bg-brand-600 text-white rounded">Create account</button>
      </form>
    </div>
  )
}
