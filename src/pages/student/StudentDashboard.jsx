import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

export default function StudentDashboard() {
  const { user } = useAuth()
  const hallId = user?.hallId
  const hall = hallId ? api.getHallById(hallId) : null
  const apps = api.listApplications({ userId: user.id })
  const notifications = hallId ? api.listNotifications({ hallId }) : api.listNotifications()
  const hasApprovedPaid = apps.some(a => a.status === 'Approved' && a.paymentDone)
  const myRenewals = api.listRenewals().filter(r => r.userId === user.id)
  const renewalRequested = myRenewals.some(r => r.status === 'Requested' || r.status === 'Approved')
  const requestRenewal = () => { api.requestRenewal(user.id); window.location.reload() }
  return (
    <div className="grid gap-6">
      {hall && (
        <div className="relative overflow-hidden rounded-lg border min-h-[140px]">
          <div className="absolute inset-0" style={{ backgroundImage: `url(${hall.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative p-4 text-white">
            <div className="text-sm uppercase tracking-wide">Student • My Hall</div>
            <div className="text-xl font-semibold">{hall.name}</div>
          </div>
        </div>
      )}
      <div className="bg-white border rounded p-4">
        <h2 className="text-lg font-semibold">Welcome, {user.name}</h2>
        <p className="text-sm text-gray-600">Role: Student</p>
        {hallId && (
          <div className="mt-2 text-sm text-gray-700">
            My Hall: {api.getHallById(hallId)?.name}
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white border rounded p-4">
          <h3 className="font-medium mb-2">Admission</h3>
          <p className="text-sm text-gray-600 mb-3">Fill the latest form to apply for a seat.</p>
          <Link to="/student/form" className="text-brand-700 text-sm">Go to form →</Link>
        </div>
        <div className="bg-white border rounded p-4">
          <h3 className="font-medium mb-2">My Applications</h3>
          {apps.length === 0 ? (
            <p className="text-sm text-gray-600">No applications yet.</p>
          ) : (
            <ul className="text-sm list-disc pl-5">
              {apps.map(a => (
                <li key={a.id}>{new Date(a.createdAt).toLocaleString()} – <span className="font-medium">{a.status}</span> {a.paymentDone ? '(Paid)' : '(Unpaid)'}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="bg-white border rounded p-4">
        <h3 className="font-medium mb-2">Renewal</h3>
        {renewalRequested ? (
          <p className="text-sm text-gray-600">Renewal requested. Please wait for admin review.</p>
        ) : hasApprovedPaid ? (
          <button className="px-3 py-2 bg-brand-600 text-white rounded text-sm" onClick={requestRenewal}>Request Renewal</button>
        ) : (
          <p className="text-sm text-gray-600">Renewal available after you are approved and payment is confirmed.</p>
        )}
      </div>
      <div className="bg-white border rounded p-4">
        <h3 className="font-medium mb-2">Notifications</h3>
        <ul className="text-sm list-disc pl-5">
          {notifications.map(n => (
            <li key={n.id}><span className="font-medium">{n.title}</span> – {n.body}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
