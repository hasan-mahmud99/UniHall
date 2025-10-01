import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'
import DynamicFormRenderer from '../../components/DynamicFormRenderer.jsx'

export default function FormFill() {
  const { user } = useAuth()
  const nav = useNavigate()
  const form = api.getActiveFormForHall(user.hallId)
  if (!form) return <p>No active form available.</p>

  const submit = ({ data, attachments, score }) => {
    api.submitApplication({ userId: user.id, formId: form.id, data, attachments })
    nav('/student')
  }

  return (
    <div className="bg-white border rounded p-4">
      <h2 className="text-lg font-semibold mb-4">{form.name}</h2>
      <DynamicFormRenderer schema={form.schema} onSubmit={submit} submitLabel="Submit Application" />
    </div>
  )
}
