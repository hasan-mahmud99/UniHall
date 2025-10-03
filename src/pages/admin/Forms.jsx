import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

export default function Forms() {
  const { user } = useAuth()
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingForm, setEditingForm] = useState(null)
  const forms = api.listForms()
  const hallForms = forms.filter(f => f.hallId === user?.hallId)

  const publishForm = (formId) => {
    api.setActiveForm(formId, user?.hallId)
    window.location.reload()
  }

  const unpublishForm = (formId) => {
    const forms = api.listForms()
    const form = forms.find(f => f.id === formId)
    if (form) {
      form.active = false
      api.saveForm(form)
      window.location.reload()
    }
  }

  const editForm = (form) => {
    setEditingForm(form)
    setShowBuilder(true)
  }

  const closeBuilder = () => {
    setShowBuilder(false)
    setEditingForm(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Management</h1>
          <p className="text-gray-600">Create and manage admission forms for your hall</p>
        </div>
        <button
          onClick={() => { setEditingForm(null); setShowBuilder(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Create New Form
        </button>
      </div>

      {showBuilder && (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingForm ? 'Edit Form (Create New Version)' : 'Form Builder'}
            </h2>
            <button
              onClick={closeBuilder}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          <FormBuilder hallId={user?.hallId} onComplete={closeBuilder} editingForm={editingForm} />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Forms</h2>
        {hallForms.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No forms created yet. Click "Create New Form" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hallForms.map(form => (
              <FormCard
                key={form.id}
                form={form}
                onPublish={publishForm}
                onUnpublish={unpublishForm}
                onEdit={editForm}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FormBuilder({ hallId, onComplete, editingForm }) {
  const [title, setTitle] = useState(editingForm?.title || editingForm?.name || '')
  const [fields, setFields] = useState(
    editingForm?.fields || editingForm?.schema || []
  )

  const addField = (index = null) => {
    const newField = { 
      label: '', 
      type: 'text', 
      required: false,
      documentRequired: false,
      score: 0
    }
    
    if (index === null) {
      // Add at the end
      setFields([...fields, newField])
    } else {
      // Add after specific index
      const updated = [...fields]
      updated.splice(index + 1, 0, newField)
      setFields(updated)
    }
  }

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index, key, value) => {
    const updated = [...fields]
    updated[index][key] = value
    setFields(updated)
  }

  const saveForm = () => {
    if (!title.trim()) return alert('Form title is required')
    if (fields.length === 0) return alert('At least one field is required')
    if (fields.some(f => !f.label.trim())) return alert('All fields must have labels')

    api.createForm({
      hallId,
      title,
      fields,
      name: title,
      schema: fields,
    })
    alert(editingForm ? 'New form version created successfully!' : 'Form created successfully!')
    onComplete()
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Spring 2025 Admission Form"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Form Fields</label>
          {fields.length === 0 && (
            <button
              onClick={() => addField()}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              + Add First Field
            </button>
          )}
        </div>

        {fields.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-600">No fields added yet. Click "Add First Field" to start building your form.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                <div className="space-y-3">
                  {/* Field Label */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Field Label</label>
                    <input
                      value={field.label}
                      onChange={e => updateField(idx, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="e.g., Full Name, Student ID, Department"
                    />
                  </div>

                  {/* Field Type and Required */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Field Type</label>
                      <select
                        value={field.type}
                        onChange={e => updateField(idx, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="textarea">Long Text</option>
                        <option value="select">Dropdown</option>
                        <option value="file">File Upload</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Score</label>
                      <input
                        type="number"
                        value={field.score || 0}
                        onChange={e => updateField(idx, 'score', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={e => updateField(idx, 'required', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">Required</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.documentRequired}
                        onChange={e => updateField(idx, 'documentRequired', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">Document Required</span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => addField(idx)}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium"
                    >
                      + Add Field Below
                    </button>
                    <button
                      onClick={() => removeField(idx)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t-2">
        <button
          onClick={saveForm}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {editingForm ? 'Save as New Version' : 'Create Form'}
        </button>
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function FormCard({ form, onPublish, onUnpublish, onEdit }) {
  const applications = api.listApplications({ formId: form.id })
  
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{form.title || form.name}</h3>
            {form.active ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                Published
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                Draft
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Created: {new Date(form.createdAt).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-600">
            {applications.length} application(s) received
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(form)}
            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
          >
            Edit
          </button>
          {form.active ? (
            <button
              onClick={() => onUnpublish(form.id)}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Unpublish
            </button>
          ) : (
            <button
              onClick={() => onPublish(form.id)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="border-t pt-3 mt-3">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Form Fields ({(form.fields || form.schema || []).length}):
        </div>
        <div className="space-y-1">
          {(form.fields || form.schema || []).map((field, idx) => (
            <div key={idx} className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="font-medium text-blue-900">{field.label}</span>
                <span className="text-xs text-blue-600">({field.type})</span>
                {field.required && <span className="text-red-600 text-xs">*Required</span>}
                {field.documentRequired && <span className="text-purple-600 text-xs">📎 Doc</span>}
              </div>
              {field.score > 0 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Score: {field.score}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
