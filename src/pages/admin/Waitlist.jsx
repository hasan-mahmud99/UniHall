import React from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

export default function Waitlist() {
  const { user } = useAuth()
  const hallId = user?.hallId
  const list = api.listWaitlist({ hallId })
  const setPaid = (id, paid) => { api.markPayment(id, paid); window.location.reload() }
  return (
    <div className="bg-white border rounded p-4">
      <h2 className="text-lg font-semibold mb-3">Waitlist</h2>
      {list.length === 0 ? <p className="text-sm text-gray-600">No students on waitlist.</p> : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="p-2">App ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Paid</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(a => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.id}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2">{a.paymentDone ? 'Yes' : 'No'}</td>
                <td className="p-2">
                  <button className="px-2 py-1 border rounded" onClick={() => setPaid(a.id, true)}>Confirm (Mark Paid)</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
