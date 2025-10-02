import React from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../lib/mockApi.js'
import { getHallImage } from '../../lib/hallImages.js'
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
    <div className="space-y-8">
      {/* Hall Header */}
      {hall && (
        <div className="relative overflow-hidden rounded-lg shadow-lg min-h-[180px]">
          <div className="absolute inset-0" style={{ backgroundImage: `url(${getHallImage(hall)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative p-6 text-white">
            <div className="text-sm font-medium text-gray-200 uppercase tracking-wide">Hall Administration Portal</div>
            <div className="text-2xl font-bold mb-1">{hall.name}</div>
            <div className="text-sm text-gray-300">Established: {hall.established} | Category: {hall.category} | Capacity: {hall.capacity} students</div>
          </div>
        </div>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Applications" value={apps.length} to="/admin/applications" color="blue" />
        <StatCard title="Available Seats" value={seats.length} to="/admin/seat-plan" color="green" />
        <StatCard title="Waiting List" value={waitlist.length} to="/admin/waitlist" color="orange" />
        <StatCard title="Renewal Requests" value={renewals.length} to="/admin/renewals" color="purple" />
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ManagementCard 
          title="Application Management" 
          description="Create and manage application forms, review student applications, and process admissions for your hall"
          to="/admin/applications"
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
        />
        <ManagementCard 
          title="Seat Allocation Management"
          description="Manage room assignments, seat availability, and accommodation allocation for hall residents"
          to="/admin/seat-plan" 
          bgColor="bg-green-50"
          borderColor="border-green-200"
        />
        <ManagementCard 
          title="Waiting List Management"
          description="Process pending applications, manage the waiting queue, and handle admission priorities"
          to="/admin/waitlist"
          bgColor="bg-orange-50" 
          borderColor="border-orange-200"
        />
        <ManagementCard 
          title="Renewal Processing"
          description="Handle accommodation renewal requests, process extensions, and manage continuing students"
          to="/admin/renewals"
          bgColor="bg-purple-50"
          borderColor="border-purple-200" 
        />
      </div>
    </div>
  )
}

function StatCard({ title, value, to, color = 'blue' }) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50', 
    orange: 'border-orange-200 bg-orange-50',
    purple: 'border-purple-200 bg-purple-50'
  }
  
  const content = (
    <div className={`border rounded-lg p-6 ${colorClasses[color]} hover:shadow-lg transition-shadow duration-200`}>
      <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {to && <div className="text-xs text-gray-500 mt-2">Click to manage</div>}
    </div>
  )
  return to ? <Link to={to} className="block">{content}</Link> : content
}

function ManagementCard({ title, description, to, bgColor, borderColor }) {
  return (
    <Link to={to} className="block group">
      <div className={`${bgColor} ${borderColor} border rounded-lg p-6 hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
        <div className="text-blue-600 text-sm font-medium group-hover:text-blue-700">
          Manage →
        </div>
      </div>
    </Link>
  )
}
