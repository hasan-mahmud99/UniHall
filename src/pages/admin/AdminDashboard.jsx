import React from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../lib/mockApi.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminDashboard() {
  const { user } = useAuth()
  const hallId = user?.hallId
  const hall = hallId ? api.getHallById(hallId) : null
  const apps = api.listApplications({ hallId })
  const seats = api.listSeats({ hallId })
  const waitlist = api.listWaitlist({ hallId })
  const renewals = api.listRenewals()
  return (
    <div className="grid gap-8">
      {/* Hero Section */}
      {hall && (
        <div className="relative overflow-hidden rounded-2xl shadow-2xl min-h-[200px]">
          <div className="absolute inset-0" style={{ backgroundImage: `url(${hall.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/60 to-transparent" />
          <div className="relative p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🏛️</span>
              </div>
              <div className="text-sm uppercase tracking-wide font-medium">Hall Administration</div>
            </div>
            <div className="text-3xl font-bold mb-2">{hall.name}</div>
            <div className="text-blue-100 text-sm">Managing hall operations and student services</div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat title="Applications" value={apps.length} to="/admin/applications" icon="📝" color="blue" />
        <Stat title="Available Seats" value={seats.length} to="/admin/seat-plan" icon="🪑" color="green" />
        <Stat title="Waitlist" value={waitlist.length} to="/admin/waitlist" icon="⏳" color="yellow" />
        <Stat title="Renewals" value={renewals.length} to="/admin/renewals" icon="🔄" color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white to-gray-50 border rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard 
            title="Form Builder" 
            description="Create and manage application forms" 
            to="/admin/applications" 
            icon="📋" 
            gradient="from-blue-500 to-blue-600"
          />
          <ActionCard 
            title="Seat Management" 
            description="Manage room assignments and availability" 
            to="/admin/seat-plan" 
            icon="🛏️" 
            gradient="from-green-500 to-green-600"
          />
          <ActionCard 
            title="Review Waitlist" 
            description="Process waiting applications" 
            to="/admin/waitlist" 
            icon="📋" 
            gradient="from-yellow-500 to-yellow-600"
          />
          <ActionCard 
            title="Handle Renewals" 
            description="Review renewal requests" 
            to="/admin/renewals" 
            icon="🔄" 
            gradient="from-purple-500 to-purple-600"
          />
        </div>
      </div>
    </div>
  )
}

function Stat({ title, value, to, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-700',
    green: 'from-green-500 to-green-600 text-green-700',
    yellow: 'from-yellow-500 to-yellow-600 text-yellow-700',
    purple: 'from-purple-500 to-purple-600 text-purple-700'
  }
  
  const content = (
    <div className="bg-white border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-white text-lg`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      {to && <div className="text-xs text-gray-500 mt-2">Click to view details</div>}
    </div>
  )
  return to ? <Link to={to} className="block hover:no-underline">{content}</Link> : content
}

function ActionCard({ title, description, to, icon, gradient }) {
  return (
    <Link to={to} className="block group">
      <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center text-white text-xl mb-4`}>
          {icon}
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        <div className="mt-3 text-xs font-medium text-blue-600 group-hover:text-blue-700">Learn more →</div>
      </div>
    </Link>
  )
}
