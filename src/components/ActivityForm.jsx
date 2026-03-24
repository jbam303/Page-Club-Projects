import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ActivityForm({ initialData = null, onClose }) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [status, setStatus] = useState(initialData?.status || 'Pendiente')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!initialData

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = { title, description, status }

    let resultError;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('activities')
        .update(payload)
        .eq('id', initialData.id)
      resultError = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('activities')
        .insert([payload])
      resultError = insertError;
    }

    if (resultError) {
      setError('Ocurrió un error al guardar: ' + resultError.message)
      setLoading(false)
    } else {
      setLoading(false)
      onClose(true) // true indicates success, should refresh list
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-outline-variant/30 bg-surface-container p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-outline-variant/20 pb-4">
          <h3 className="font-headline text-xl font-bold text-primary-container">
            {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="text-on-surface-variant hover:text-on-surface"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-error/50 bg-error-container/20 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-on-surface-variant">
              Título
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="terminal-glow w-full rounded border border-outline-variant/30 bg-surface px-3 py-2 text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:outline-none"
              placeholder="Ej: Semana 1: Kickoff"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-on-surface-variant">
              Descripción
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="terminal-glow w-full rounded border border-outline-variant/30 bg-surface px-3 py-2 text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:outline-none"
              placeholder="Detalles sobre la actividad..."
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-on-surface-variant">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="terminal-glow w-full rounded border border-outline-variant/30 bg-surface px-3 py-2 text-on-surface transition-all focus:outline-none"
            >
              <option value="Completado">Completado</option>
              <option value="En progreso">En progreso</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="rounded px-4 py-2 font-mono text-sm uppercase text-on-surface-variant hover:text-on-surface"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-primary-container px-6 py-2 font-bold uppercase tracking-widest text-on-primary-container shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all hover:bg-primary-fixed disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
