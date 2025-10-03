import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import * as api from './lib/mockApi.js'
import { getHallImage } from './lib/hallImages.js'
import StudentDashboard from './pages/student/StudentDashboard.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import FormFill from './pages/student/FormFill.jsx'
import Applications from './pages/admin/Applications.jsx'
import Forms from './pages/admin/Forms.jsx'
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
  const hallObj = user?.hallId ? api.getHallById(user.hallId) : null
  const hallImg = getHallImage(hallObj)
  // Apply hall background for logged-in users; ensure cover/center and fixed subtle overlay for readability
  const bgStyle = hallImg
    ? { backgroundImage: `url(${hallImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    : {}
  
  // Get notifications for ticker
  const hallId = user?.hallId
  const notifications = hallId ? api.listNotifications({ hallId }) : api.listNotifications()
  
  return (
    <div className="min-h-screen flex flex-col relative" style={bgStyle}>
      {hallImg && <div className="absolute inset-0 bg-black/30 pointer-events-none" aria-hidden="true" />}
      <Nav />
      {/* Notification Ticker right below nav */}
      <Ticker items={notifications.slice(-5).map(n => `${n.title}: ${n.body}`)} />
      <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 bg-white/85 backdrop-blur-sm rounded-lg">
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
          <Route path="/admin/forms" element={
            <ProtectedRoute roles={["admin"]}>
              <Forms />
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
  const [selectedHall, setSelectedHall] = useState(null)
  
  // Ensure halls are seeded/normalized before first render reads them
  api.ensureSeedData()
  const allHalls = api.listHalls()
  // Deduplicate by shortName and keep consistent order
  const order = ['ASH','MUH','BKH','JSH','NFH']
  const seen = new Set()
  const halls = []
  for (const h of allHalls) {
    if (h && h.shortName && !seen.has(h.shortName)) { halls.push(h); seen.add(h.shortName) }
  }
  halls.sort((a,b) => order.indexOf(a.shortName) - order.indexOf(b.shortName))

  const handleHallClick = (hall) => {
    if (user?.role === 'admin' && user?.hallId === hall.id) {
      // Admin navigates to their dashboard
      return
    }
    setSelectedHall(hall)
  }

  const closeModal = () => setSelectedHall(null)

  return (
    <section className="grid gap-6">
      {/* Header Section */}
      <div className="bg-white border rounded-lg p-8 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">NSTU Halls of Residence</h1>
        <p className="mt-3 max-w-3xl text-gray-700">
          Noakhali Science and Technology University provides five residential halls to accommodate students. 
          Click on any hall to view detailed information and contact details.
        </p>
        {!user && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login" className="px-5 py-2.5 bg-brand-600 text-white rounded shadow hover:bg-brand-700 transition">Login</Link>
            <Link to="/register" className="px-5 py-2.5 bg-white text-gray-900 border rounded shadow hover:shadow-md transition">Register (Students)</Link>
          </div>
        )}
      </div>

      {/* Five Hall Panels with Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {halls.map(h => {
          const isAdminHall = user?.role === 'admin' && user?.hallId === h.id
          const Component = isAdminHall ? Link : 'button'
          const props = isAdminHall 
            ? { to: '/admin' } 
            : { onClick: () => handleHallClick(h), type: 'button' }
          
          return (
            <Component key={h.id} {...props} className="block group w-full text-left">
              <div className="relative h-48 rounded-lg overflow-hidden border bg-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                <div className="absolute inset-0" style={{ backgroundImage: `url(${getHallImage(h)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/60 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="text-base font-semibold leading-tight drop-shadow-lg">{h.name}</div>
                  <div className="text-xs text-white/90 mt-1">{h.shortName} • {h.category} • Est. {h.established}</div>
                </div>
                <div className="absolute top-2 right-2 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-gray-700 text-xs font-medium">Click for details</span>
                </div>
              </div>
            </Component>
          )
        })}
      </div>

      {/* Hall Details Modal */}
      {selectedHall && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">{selectedHall.name}</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Hall Image */}
                <div className="md:w-2/5">
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-md">
                    <div className="absolute inset-0" style={{ backgroundImage: `url(${getHallImage(selectedHall)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-block bg-brand-100 text-brand-800 px-4 py-2 rounded-full text-sm font-semibold">
                      {selectedHall.shortName}
                    </span>
                  </div>
                </div>
                
                {/* Hall Information */}
                <div className="md:w-3/5 space-y-6">
                  <div>
                    <p className="text-sm text-gray-600">Established in {selectedHall.established}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Hall Details</h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          <span className="text-brand-600 mt-0.5">📋</span>
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm font-medium text-gray-900">{selectedHall.category}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-brand-600 mt-0.5">👥</span>
                          <div>
                            <p className="text-xs text-gray-500">Capacity</p>
                            <p className="text-sm font-medium text-gray-900">{selectedHall.capacity}+ students</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-brand-600 mt-0.5">📍</span>
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="text-sm font-medium text-gray-900">NSTU Campus, Sonapur</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-brand-600 mt-0.5">🏛️</span>
                          <div>
                            <p className="text-xs text-gray-500">Established</p>
                            <p className="text-sm font-medium text-gray-900">{selectedHall.established}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-2">Provost</p>
                          <p className="font-semibold text-gray-900 mb-3">{selectedHall.provost?.name || 'Hall Provost'}</p>
                          <div className="space-y-2">
                            {selectedHall.provost?.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-brand-600">📞</span>
                                <a href={`tel:${selectedHall.provost.phone}`} className="text-brand-600 hover:underline">
                                  {selectedHall.provost.phone}
                                </a>
                              </div>
                            )}
                            {selectedHall.provost?.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-brand-600">✉️</span>
                                <a href={`mailto:${selectedHall.provost.email}`} className="text-brand-600 hover:underline">
                                  {selectedHall.provost.email}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedHall.address && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Address</h3>
                        <div className="flex items-start gap-2">
                          <span className="text-brand-600 mt-0.5">🏢</span>
                          <p className="text-sm text-gray-700">{selectedHall.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* University Contact Information */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">University Contact Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Noakhali Science and Technology University</h3>
            <p className="text-sm text-gray-600 space-y-1">
              <span className="block">Sonapur, Noakhali-3814, Bangladesh</span>
              <span className="block">📞 Phone: +880-2334-496522</span>
              <span className="block">📠 Fax: +880-2334-496523</span>
              <span className="block">✉️ Email: registrar@office.nstu.edu.bd</span>
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Important Links</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <a href="https://nstu.edu.bd" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">NSTU Official Website</a></li>
              <li>• <a href="https://nstu.edu.bd/halls.html" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Halls Information</a></li>
              <li>• <a href="https://www.admission.nstu.edu.bd/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Admission Portal</a></li>
            </ul>
          </div>
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

function InfoCard({ title, desc }) {
  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="text-sm text-gray-600 mt-1">{desc}</div>
    </div>
  )
}
