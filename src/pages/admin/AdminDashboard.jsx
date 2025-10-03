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
  const complaints = api.listComplaints({ hallId })
  const pendingComplaints = complaints.filter(c => c.status === 'Open').length
  
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
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Applications" value={apps.length} color="blue" />
          <StatCard title="Total Seats" value={seats.length} color="green" />
          <StatCard title="Occupied Seats" value={seats.filter(s => s.status === 'Occupied').length} color="purple" />
          <StatCard title="Pending Complaints" value={pendingComplaints} color="orange" />
        </div>
      </div>

      {/* Management Sections */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Administration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ManagementCard 
            title="Create Form" 
            description="Build and manage admission forms"
            to="/admin/forms"
            bgColor="bg-white"
            borderColor="border-gray-300"
          />
          <ManagementCard 
            title="Manage Notifications"
            description="Create and publish hall notifications"
            to="/notifications" 
            bgColor="bg-white"
            borderColor="border-gray-300"
          />
          <ManagementCard 
            title="View Applications"
            description="Review submitted applications by form"
            to="/admin/applications"
            bgColor="bg-white" 
            borderColor="border-gray-300"
          />
          <ManagementCard 
            title="Seat Management"
            description="Allocate and manage room assignments"
            to="/admin/seat-plan"
            bgColor="bg-white"
            borderColor="border-gray-300" 
          />
          <ManagementCard 
            title="Complaints"
            description={`Review and respond to hall complaints${pendingComplaints ? ` (${pendingComplaints} pending)` : ''}`}
            to="/complaints"
            bgColor="bg-white"
            borderColor="border-gray-300" 
          />
          <ManagementCard 
            title="Waiting List"
            description="Process pending applications queue"
            to="/admin/waitlist"
            bgColor="bg-white" 
            borderColor="border-gray-300"
          />
          <ManagementCard 
            title="Renewals"
            description="Handle accommodation renewal requests"
            to="/admin/renewals"
            bgColor="bg-white"
            borderColor="border-gray-300" 
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
  }
  
  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 border-2`}>
      <h3 className="text-xs font-medium uppercase tracking-wide opacity-75">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function ManagementCard({ title, description, to, bgColor, borderColor }) {
  return (
    <Link to={to} className="block group">
      <div className={`${bgColor} ${borderColor} border-2 rounded-lg p-5 hover:shadow-md transition-all duration-200`}>
        <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        <div className="text-blue-600 text-sm font-medium mt-3 group-hover:text-blue-700">
          Access →
        </div>
      </div>
    </Link>
  )
}
