import React, { useState } from 'react'

export default function DynamicFormRenderer({ schema = [], onSubmit, submitLabel = 'Submit' }) {
  const [form, setForm] = useState({})
  const [files, setFiles] = useState({})
  const update = (id, value) => setForm(f => ({ ...f, [id]: value }))
  const updateFile = (id, file) => setFiles(prev => ({ ...prev, [id]: file }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Calculate simple score as sum of field scores that have truthy values
    const totalScore = (schema || []).reduce((sum, f) => {
      const v = form[f.id]
      const has = Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== null && String(v).trim() !== '')
      return sum + (has ? (Number(f.score) || 0) : 0)
    }, 0)
    onSubmit?.({ data: form, attachments: files, score: totalScore })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {schema.map(field => (
        <Field key={field.id} field={field} value={form[field.id]}
               onChange={(v) => update(field.id, v)} onFileChange={(file) => updateFile(field.id, file)} />
      ))}
      <div>
        <button className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">{submitLabel}</button>
      </div>
    </form>
  )
}

function Field({ field, value, onChange, onFileChange }) {
  const base = 'w-full rounded border border-gray-300 px-3 py-2 text-sm'
  if (field.type === 'text' || field.type === 'number' || field.type === 'date') {
    return (
      <label className="grid gap-1">
        <span className="text-sm text-gray-700">{field.label}{field.required && ' *'}</span>
        <input type={field.type === 'number' ? 'number' : field.type}
               className={base}
               required={field.required}
               value={value ?? ''}
               onChange={(e) => onChange(e.target.value)} />
        {field.requiresDocument && (
          <input type="file" className="text-sm" onChange={(e) => onFileChange?.(e.target.files?.[0] || null)} />
        )}
      </label>
    )
  }
  if (field.type === 'dropdown') {
    return (
      <label className="grid gap-1">
        <span className="text-sm text-gray-700">{field.label}{field.required && ' *'}</span>
        <select className={base} required={field.required}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}>
          <option value="" disabled>Select...</option>
          {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {field.requiresDocument && (
          <input type="file" className="text-sm" onChange={(e) => onFileChange?.(e.target.files?.[0] || null)} />
        )}
      </label>
    )
  }
  if (field.type === 'checkbox') {
    const arr = Array.isArray(value) ? value : []
    const toggle = (opt) => {
      if (arr.includes(opt)) onChange(arr.filter(o => o !== opt))
      else onChange([...arr, opt])
    }
    return (
      <fieldset className="grid gap-1">
        <legend className="text-sm text-gray-700">{field.label}</legend>
        <div className="flex flex-wrap gap-3">
          {(field.options || []).map(opt => (
            <label key={opt} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={arr.includes(opt)} onChange={() => toggle(opt)} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {field.requiresDocument && (
          <input type="file" className="text-sm" onChange={(e) => onFileChange?.(e.target.files?.[0] || null)} />
        )}
      </fieldset>
    )
  }
  return null
}
