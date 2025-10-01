import React, { useState } from 'react'
import * as api from '../../lib/mockApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import FormBuilder from '../../components/FormBuilder.jsx'

export default function Applications() {
  const { user } = useAuth()
  const hallId = user?.hallId ?? null
  const [forms, setForms] = useState(api.listForms({ hallId }))
  const apps = api.listApplications({ hallId })
  const [selected, setSelected] = useState(forms[0] || null)

  const saveForm = (f) => {
    const payload = { ...f, hallId }
    const saved = f.id ? api.saveForm(payload) : api.createForm(payload)
    if (saved.active) api.setActiveForm(saved.id, hallId)
    setForms(api.listForms({ hallId }))
    setSelected(saved)
  }
  const setActive = (id) => {
    api.setActiveForm(id, hallId)
    setForms(api.listForms({ hallId }))
  }

  const updateStatus = (id, status) => { api.updateApplicationStatus(id, status); window.location.reload() }
  const setPaid = (id, paid) => { api.markPayment(id, paid); window.location.reload() }

  return (
    <div className="grid gap-8">
      {/* Form Builder Section */}
      <div className="bg-gradient-to-br from-white to-blue-50 border rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Form Builder & Management
          </h2>
          <p className="text-blue-100 mt-2">Create, edit, and publish forms for your hall</p>
        </div>
        
        <div className="p-6">
          {/* Form Tabs */}
          <div className="flex flex-wrap gap-3 mb-6">
            {forms.map(f => (
              <button 
                key={f.id} 
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                  selected?.id === f.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300'
                }`} 
                onClick={() => setSelected(f)}
              >
                {f.name} 
                {f.active && <span className="ml-2 px-2 py-0.5 bg-green-400 text-white text-xs rounded-full">LIVE</span>}
              </button>
            ))}
            <button 
              className="px-4 py-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 text-sm font-medium transition-all duration-200"
              onClick={() => setSelected({ name: '', schema: [], active: false })}
            >
              <span className="mr-2">➕</span> Create New Form
            </button>
          </div>

          {/* Form Builder */}
          {selected && (
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <FormBuilder form={selected?.id ? selected : null} onSave={saveForm} />
              
              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t">
                {selected?.id && (
                  <button 
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                    onClick={() => setActive(selected.id)}
                  >
                    <span>🚀</span>
                    Publish Form (Set Active)
                  </button>
                )}
                <button 
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  onClick={() => saveForm(selected?.id ? selected : { name: selected?.name || 'New Form', schema: selected?.schema || [], active: false })}
                >
                  <span>💾</span>
                  Save Form to Hall
                </button>
                <button 
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  onClick={() => window.open('/student/form', '_blank')}
                >
                  <span>👁️</span>
                  Preview Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applications Management */}
      <div className="bg-white border rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📝</span>
            Student Applications
          </h2>
          <p className="text-gray-300 mt-2">Review and manage incoming applications</p>
        </div>
        
        <div className="p-6">
          {apps.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Applications Yet</h3>
              <p className="text-gray-600">Applications will appear here once students start submitting forms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-4 font-semibold text-gray-700">Application ID</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Payment</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Hall</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map(a => (
                    <tr key={a.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-sm">{a.id}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          a.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          a.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          a.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          a.paymentDone ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {a.paymentDone ? '✓ Paid' : '✗ Unpaid'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{a.hallId || '-'}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          <button 
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs font-medium transition-colors"
                            onClick={() => updateStatus(a.id, 'Under Review')}
                          >
                            🔍 Review
                          </button>
                          <button 
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs font-medium transition-colors"
                            onClick={() => updateStatus(a.id, 'Approved')}
                          >
                            ✓ Approve
                          </button>
                          <button 
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs font-medium transition-colors"
                            onClick={() => updateStatus(a.id, 'Rejected')}
                          >
                            ✗ Reject
                          </button>
                          <button 
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              a.paymentDone 
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                            onClick={() => setPaid(a.id, !a.paymentDone)}
                          >
                            {a.paymentDone ? '💳 Unmark' : '💵 Mark Paid'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
