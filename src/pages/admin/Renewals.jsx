import React from 'react'
import * as api from '../../lib/mockApi.js'

export default function Renewals() {
  const renewals = api.listRenewals()
  const act = (id, status) => { api.updateRenewal(id, status); window.location.reload() }
  return (
    <div className="bg-white border rounded p-4">
      <h2 className="text-lg font-semibold mb-3">Renewal Requests</h2>
      {renewals.length === 0 ? <p className="text-sm text-gray-600">No renewal requests.</p> : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="p-2">ID</th>
              <th className="p-2">User</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {renewals.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.id}</td>
                <td className="p-2">{r.userId}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 border rounded" onClick={() => act(r.id, 'Approved')}>Approve</button>
                  <button className="px-2 py-1 border rounded" onClick={() => act(r.id, 'Rejected')}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
