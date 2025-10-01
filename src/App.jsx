import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import * as api from './lib/mockApi.js'
import StudentDashboard from './pages/student/StudentDashboard.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import FormFill from './pages/student/FormFill.jsx'
import Applications from './pages/admin/Applications.jsx'
import SeatPlan from './pages/admin/SeatPlan.jsx'
import Waitlist from './pages/admin/Waitlist.jsx'
import Renewals from './pages/admin/Renewals.jsx'
import Complaints from './pages/shared/Complaints.jsx'
import Notifications from './pages/shared/Notifications.jsx'
import ExamDashboard from './pages/exam/ExamDashboard.jsx'
import Results from './pages/exam/Results.jsx'
import SeatPlans from './pages/exam/SeatPlans.jsx'
import StaffDashboard from './pages/staff/StaffDashboard.jsx'

function Nav() {
  const { user, logout } = useAuth()
  const doReset = () => { api.resetDemoData(); window.location.reload() }
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        <Link to="/" className="font-semibold text-brand-700">UniHall</Link>
        <nav className="text-sm text-gray-600 flex gap-3">
          <Link to="/notifications" className="hover:text-brand-700">Notifications</Link>
          <Link to="/complaints" className="hover:text-brand-700">Complaints</Link>
          {user?.role === 'admin' && <Link to="/admin" className="hover:text-brand-700">Admin</Link>}
          {user?.role === 'examcontroller' && <Link to="/exam" className="hover:text-brand-700">Exam</Link>}
          {user?.role === 'staff' && <Link to="/staff" className="hover:text-brand-700">Staff</Link>}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-gray-700">{user.name} ({user.role})</span>
              <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
              <button onClick={doReset} className="text-sm text-gray-500 hover:underline" title="Reset demo data">Reset</button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-brand-700">Login</Link>
              <Link to="/register" className="text-sm text-brand-700">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  const hallImg = user?.hallId ? api.getHallById(user.hallId)?.img : ''
  // Apply hall background for logged-in users
  const bgStyle = hallImg ? { backgroundImage: `url(${hallImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
  return (
    <div className="min-h-screen flex flex-col" style={bgStyle}>
      <Nav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 bg-white/80 backdrop-blur-md rounded-lg">
        <Routes>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/student" element={
            <ProtectedRoute roles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/form" element={
            <ProtectedRoute roles={["student"]}>
              <FormFill />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/exam" element={
            <ProtectedRoute roles={["examcontroller"]}>
              <ExamDashboard />
            </ProtectedRoute>
          } />
          <Route path="/exam/results" element={
            <ProtectedRoute roles={["examcontroller"]}>
              <Results />
            </ProtectedRoute>
          } />
          <Route path="/exam/seat-plans" element={
            <ProtectedRoute roles={["examcontroller"]}>
              <SeatPlans />
            </ProtectedRoute>
          } />

          <Route path="/staff" element={
            <ProtectedRoute roles={["staff"]}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/applications" element={
            <ProtectedRoute roles={["admin"]}>
              <Applications />
            </ProtectedRoute>
          } />
          <Route path="/admin/seat-plan" element={
            <ProtectedRoute roles={["admin"]}>
              <SeatPlan />
            </ProtectedRoute>
          } />
          <Route path="/admin/waitlist" element={
            <ProtectedRoute roles={["admin"]}>
              <Waitlist />
            </ProtectedRoute>
          } />
          <Route path="/admin/renewals" element={
            <ProtectedRoute roles={["admin"]}>
              <Renewals />
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={<Notifications />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function Home() {
  const { user } = useAuth()
  const [bg, setBg] = useState('')
  useEffect(() => {
    const halls = api.listHalls()
    const pick = halls[Math.floor(Math.random() * halls.length)]
    setBg(pick?.img || '')
  }, [])
  const hallId = user?.hallId
  const notifications = hallId ? api.listNotifications({ hallId }) : api.listNotifications()
  return (
    <section className="grid gap-6">
      <div className="relative overflow-hidden rounded-lg border min-h-[300px]">
        {bg && <div className="absolute inset-0" style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        <div className="relative p-8 sm:p-12 text-white">
          <h1 className="text-3xl sm:text-4xl font-semibold">UniHall – NSTU Hall Allotment System</h1>
          <p className="mt-3 max-w-3xl text-white/90">
            A transparent and efficient platform for NSTU hall seat applications and management.
            Students apply and track status; admins manage forms, seat plans, notices, and complaints.
          </p>
          {!user && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/login" className="px-5 py-2.5 bg-white text-gray-900 rounded shadow hover:shadow-md transition">Login</Link>
              <Link to="/register" className="px-5 py-2.5 bg-brand-600 text-white rounded shadow hover:bg-brand-700 transition">Register (Students)</Link>
            </div>
          )}
        </div>
      </div>

      <Ticker items={notifications.slice(-5).map(n => `${n.title}: ${n.body}`)} />

      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard icon="🏛️" title="NSTU Halls" desc="Five residential halls — two for male and three for female students." />
        <InfoCard icon="📝" title="Dynamic Forms" desc="Hall admission forms can change every session without code changes." />
        <InfoCard icon="🪑" title="Seat Management" desc="Admins can manage seats by status and assign beds per room." />
      </div>

      <div className="bg-white border rounded-lg p-6 grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">About NSTU Halls</h3>
          <p className="mt-2 text-gray-600">
            NSTU has five residential halls. Each hall is overseen by dedicated hall administration to ensure
            a safe and conducive living environment.
          </p>
          <ul className="mt-3 text-sm text-gray-700 list-disc pl-5">
            {api.listHalls().map(h => <li key={h.id}>{h.name} ({h.category})</li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">About This Project</h3>
          <p className="mt-2 text-gray-600">
            UniHall replaces manual, paper processes with a streamlined, automated workflow for applications,
            renewals, seat allocation, hall notices, and complaints — all scoped per hall.
          </p>
        </div>
      </div>
    </section>
  )
}

function Card({ title, desc, to }) {
  return (
    <Link to={to} className="block bg-white border rounded-lg p-6 hover:shadow-sm transition">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-1 text-sm">{desc}</p>
    </Link>
  )
}

function Ticker({ items }) {
  if (!items || items.length === 0) return null
  return (
    <div className="bg-brand-600 text-white rounded overflow-hidden shadow">
      <div className="whitespace-nowrap animate-[ticker_20s_linear_infinite] p-2 text-sm">
        {items.concat(items).map((t, idx) => (
          <span key={idx} className="mx-6">• {t}</span>
        ))}
      </div>
      <style>{`@keyframes ticker { 0%{ transform: translateX(0);} 100%{ transform: translateX(-50%);} }`}</style>
    </div>
  )
}

function InfoCard({ icon, title, desc }) {
  return (
    <div className="bg-white border rounded p-4 flex gap-3 items-start shadow-sm">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600">{desc}</div>
      </div>
    </div>
  )
}
