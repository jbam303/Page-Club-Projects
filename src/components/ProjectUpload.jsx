import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProjectUpload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState({ text: '', type: '' }) // type: 'error' | 'success'

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    setFile(selected)
    setMessage({ text: '', type: '' })
    setUploadProgress(0)

    if (selected) {
      if (selected.size > MAX_FILE_SIZE) {
        setMessage({ text: 'Archivo demasiado pesado (Máximo 5MB).', type: 'error' })
        setFile(null)
        e.target.value = '' // Reset input
      } else if (!selected.type.match(/(image.*|application\/zip)/)) {
        // Example check: only allow images or zips
        setMessage({ text: 'Formato no permitido. Sube un ZIP o Imagen.', type: 'error' })
        setFile(null)
        e.target.value = ''
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setMessage({ text: '', type: '' })
    setUploadProgress(10) // Simulate starting progress

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `proyectos/${fileName}`

    const { error } = await supabase.storage
      .from('proyectos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      setMessage({ text: 'Error al subir el archivo: ' + error.message, type: 'error' })
      setUploadProgress(0)
    } else {
      setUploadProgress(100)
      setMessage({ text: 'Proyecto subido con éxito.', type: 'success' })
      setFile(null)
      // We would normally reset the input file here, but using a ref would be better.
      // For simplicity, it will be cleared when selecting a new one.
    }
    
    setLoading(false)
  }

  return (
    <div className="glass-card rounded-lg p-6">
      <div className="mb-6">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-widest italic text-primary-container">
          Subida de Proyectos
        </h2>
        <p className="text-sm font-light text-on-surface-variant">
          Agrega nuevos proyectos al repositorio del club (ZIP o Imágenes).
        </p>
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <div className="relative w-full sm:w-auto">
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full cursor-pointer rounded border border-outline-variant/30 bg-surface-container-low px-4 py-8 font-mono text-sm text-on-surface transition-all hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="h-full w-full rounded bg-primary-container px-8 py-[18px] font-bold uppercase tracking-widest text-on-primary-container shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all hover:bg-primary-fixed disabled:opacity-50 sm:w-auto"
        >
          {loading ? 'Subiendo...' : 'Subir'}
        </button>
      </div>

      {loading && (
        <div className="mt-4 h-2 w-full overflow-hidden rounded bg-surface-container">
          <div 
            className="h-full bg-primary-container transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {message.text && (
        <div className={`mt-4 rounded p-3 text-sm border ${message.type === 'error' ? 'bg-error-container/20 text-error border-error/50' : 'bg-primary-container/10 text-primary-container border-primary-container/30'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
