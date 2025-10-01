import React, { useState } from 'react'

const fieldTypes = ['text','number','date','dropdown','checkbox']

export default function FormBuilder({ form, onSave }) {
  const [name, setName] = useState(form?.name || '')
  const [schema, setSchema] = useState(form?.schema || [])
  const [active, setActive] = useState(form?.active || false)

  const addField = () => setSchema(s => [...s, { id: `fld-${Date.now()}`, label: 'New Field', type: 'text', required: false, options: [], score: 0, requiresDocument: false, documentLabel: '' }])
  const updateField = (id, patch) => setSchema(s => s.map(f => f.id === id ? { ...f, ...patch } : f))
  const removeField = (id) => setSchema(s => s.filter(f => f.id !== id))

  const save = (e) => {
    e.preventDefault()
    onSave?.({ ...form, name, schema, active })
  }

  return (
    <form onSubmit={save} className="grid gap-4">
      <label className="grid gap-1">
        <span className="text-sm text-gray-700">Form Name</span>
        <input className="border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Active
      </label>

      <div className="grid gap-3">
        {schema.map(f => (
          <div key={f.id} className="border rounded p-3 grid sm:grid-cols-2 gap-2">
            <input className="border rounded px-3 py-2" value={f.label} onChange={e => updateField(f.id, { label: e.target.value })} />
            <select className="border rounded px-3 py-2" value={f.type} onChange={e => updateField(f.id, { type: e.target.value })}>
              {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.required} onChange={e => updateField(f.id, { required: e.target.checked })} /> Required
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.requiresDocument} onChange={e => updateField(f.id, { requiresDocument: e.target.checked })} /> Requires document
            </label>
            <input className="border rounded px-3 py-2" placeholder="Document label (optional)" value={f.documentLabel || ''} onChange={e => updateField(f.id, { documentLabel: e.target.value })} />
            <input className="border rounded px-3 py-2" type="number" placeholder="Score (0-100)" value={f.score ?? 0} onChange={e => updateField(f.id, { score: Number(e.target.value) })} />
            {(f.type === 'dropdown' || f.type === 'checkbox') && (
              <input className="border rounded px-3 py-2 col-span-full" placeholder="Comma-separated options"
                     value={(f.options || []).join(',')} onChange={e => updateField(f.id, { options: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })} />
            )}
            <div className="col-span-full text-right">
              <button type="button" onClick={() => removeField(f.id)} className="text-sm text-red-600">Remove</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addField} className="px-3 py-2 border rounded text-sm">+ Add Field</button>
      </div>

      <div>
        <button className="px-4 py-2 bg-brand-600 text-white rounded">Save Form</button>
      </div>
    </form>
  )
}
