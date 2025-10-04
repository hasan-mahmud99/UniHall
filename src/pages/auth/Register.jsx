import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [step, setStep] = useState(1) // 1: Form, 2: OTP
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [studentId, setStudentId] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [error, setError] = useState('')

  const sendOtp = async (e) => {
    e.preventDefault()
    try {
      if (password !== confirm) throw new Error('Passwords do not match')
      if (!/^[^@]+@student\.nstu\.edu\.bd$/i.test(email)) throw new Error('Use @student.nstu.edu.bd email')
      if (!studentId) throw new Error('Student ID is required')
      
      // Generate mock OTP (6 digits)
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedOtp(mockOtp)
      
      // Show OTP in alert (in real app, this would be sent via email)
      alert(`Mock OTP sent to ${email}\n\nYour OTP is: ${mockOtp}\n\n(In production, this would be sent via email)`)
      
      setStep(2)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const verifyOtpAndRegister = async (e) => {
    e.preventDefault()
    try {
      if (otp !== generatedOtp) throw new Error('Invalid OTP. Please try again.')
      
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
      <h2 className="text-xl font-semibold mb-4">
        {step === 1 ? 'Register' : 'Verify OTP'}
      </h2>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      
      {step === 1 ? (
        <form onSubmit={sendOtp} className="grid gap-3">
          <input 
            className="border rounded px-3 py-2" 
            placeholder="Full Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required
          />
          <input 
            className="border rounded px-3 py-2" 
            placeholder="Student ID (e.g., MUHXXXX)" 
            value={studentId} 
            onChange={e => setStudentId(e.target.value)} 
            required
          />
          <input 
            className="border rounded px-3 py-2" 
            placeholder="Email (@student.nstu.edu.bd)" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required
          />
          <input 
            className="border rounded px-3 py-2" 
            placeholder="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required
          />
          <input 
            className="border rounded px-3 py-2" 
            placeholder="Confirm Password" 
            type="password" 
            value={confirm} 
            onChange={e => setConfirm(e.target.value)} 
            required
          />
          <button className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtpAndRegister} className="grid gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <p>An OTP has been sent to <strong>{email}</strong></p>
            <p className="text-xs mt-1">Check the alert popup for the mock OTP</p>
          </div>
          <input 
            className="border rounded px-3 py-2 text-center text-2xl tracking-widest" 
            placeholder="Enter 6-digit OTP" 
            value={otp} 
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
            maxLength={6}
            required
          />
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => { setStep(1); setOtp(''); setError('') }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Back
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
            >
              Verify & Register
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
