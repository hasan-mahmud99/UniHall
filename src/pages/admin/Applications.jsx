import React, { useState } from 'react'
import * as api from '../../lib/mockApi.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Applications() {
  const { user } = useAuth()
  const hallId = user?.hallId ?? null
  const forms = api.listForms({ hallId })
  const [selectedFormId, setSelectedFormId] = useState(null)
  
  // Get all applications for this hall
  const allApps = api.listApplications({ hallId })
  
  // Filter by selected form if one is chosen
  const apps = selectedFormId 
    ? allApps.filter(app => app.formId === selectedFormId)
    : allApps

  console.log('Admin Hall ID:', hallId)
  console.log('All Applications:', allApps)
  console.log('Forms:', forms)
  console.log('Filtered Apps:', apps)

  const updateStatus = (id, status) => { 
    api.updateApplicationStatus(id, status)
    window.location.reload() 
  }
  
  const setPaid = (id, paid) => { 
    api.markPayment(id, paid)
    window.location.reload() 
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Applications</h1>
        <p className="text-gray-600">Review and manage submitted applications</p>
      </div>

      {/* Debug Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
        <div><strong>Debug Info:</strong></div>
        <div>Your Hall ID: {hallId || 'None'}</div>
        <div>Total Applications: {allApps.length}</div>
        <div>Forms Available: {forms.length}</div>
        <div>Filtered Applications: {apps.length}</div>
      </div>

      {/* Form Filter */}
      {forms.length > 0 && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Form:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFormId(null)}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                selectedFormId === null
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              All Forms
            </button>
            {forms.map(form => (
              <button
                key={form.id}
                onClick={() => setSelectedFormId(form.id)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedFormId === form.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {form.title || form.name}
                {form.active && (
                  <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Applications List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Applications ({apps.length})
        </h2>
        
        {apps.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              {selectedFormId 
                ? 'No applications received for this form yet.'
                : 'No applications received yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map(app => (
              <ApplicationCard
                key={app.id}
                app={app}
                onStatusChange={updateStatus}
                onPaymentChange={setPaid}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ApplicationCard({ app, onStatusChange, onPaymentChange }) {
  const [expanded, setExpanded] = useState(false)
  const user = api.getUserById(app.userId)
  const form = api.getFormById(app.formId)
  
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Approved: 'bg-green-100 text-green-800 border-green-300',
    Rejected: 'bg-red-100 text-red-800 border-red-300',
  }

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'Unknown Student'}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[app.status]}`}>
              {app.status}
            </span>
            {app.paymentDone && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-xs font-medium">
                Paid
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Form: {form?.title || form?.name || 'Unknown Form'} • Submitted: {new Date(app.createdAt).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Email: {user?.email || 'N/A'}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {expanded ? 'Hide Details ▲' : 'View Details ▼'}
        </button>
      </div>

      {expanded && (
        <div className="border-t pt-4 mt-4 space-y-4">
          {/* Application Data */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Submitted Information:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(app.data || {}).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-gray-700">{key}:</span>{' '}
                  <span className="text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => onStatusChange(app.id, 'Approved')}
                disabled={app.status === 'Approved'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                Approve
              </button>
              <button
                onClick={() => onStatusChange(app.id, 'Rejected')}
                disabled={app.status === 'Rejected'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                Reject
              </button>
              <button
                onClick={() => onStatusChange(app.id, 'Pending')}
                disabled={app.status === 'Pending'}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                Mark Pending
              </button>
            </div>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => onPaymentChange(app.id, !app.paymentDone)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  app.paymentDone
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {app.paymentDone ? 'Mark Unpaid' : 'Mark Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
