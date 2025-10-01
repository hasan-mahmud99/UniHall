import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

export default function ExamDashboard() {
  const { user } = useAuth()
  const hallId = user?.hallId
  const results = api.listResults({ hallId })
  const seatPlans = api.listSeatPlanUploads({ hallId })
  return (
    <div className="grid gap-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Results" value={results.length} to="/exam/results" />
        <Stat title="Seat Plans" value={seatPlans.length} to="/exam/seat-plans" />
      </div>
      <div className="bg-white border rounded p-4 grid sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Upload Results</h3>
          <Link to="/exam/results" className="text-sm text-brand-700">Go to results →</Link>
        </div>
        <div>
          <h3 className="font-medium mb-2">Upload Seat Plan</h3>
          <Link to="/exam/seat-plans" className="text-sm text-brand-700">Go to seat plans →</Link>
        </div>
      </div>
    </div>
  )
}

function Stat({ title, value, to }) {
  const content = (
    <div className="bg-white border rounded p-4">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}
