import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProjectUpload() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [tecnologias, setTecnologias] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [deletingProject, setDeletingProject] = useState(null)

  // Toast notification
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const showNotification = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type })
    setTimeout(() => setNotification(n => ({ ...n, show: false })), 5000)
  }

  const fetchProjects = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('proyectos').select('*').order('created_at', { ascending: false })
    if (!error) setProjects(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  const resetForm = () => {
    setTitulo('')
    setDescripcion('')
    setRepoUrl('')
    setDemoUrl('')
    setTecnologias('')
    setImageFile(null)
    setFormError(null)
    setEditingProject(null)
  }

  const openNewForm = () => { resetForm(); setIsFormOpen(true) }

  const openEditForm = (project) => {
    setEditingProject(project)
    setTitulo(project.titulo || '')
    setDescripcion(project.descripcion || '')
    setRepoUrl(project.repo_url || '')
    setDemoUrl(project.demo_url || '')
    setTecnologias((project.tecnologias || []).join(', '))
    setImageFile(null)
    setFormError(null)
    setIsFormOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)

    let imagen_url = editingProject?.imagen_url || null

    // Upload image if a new one was selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
      const filePath = `proyectos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, imageFile, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setFormError('Error subiendo imagen: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('projects').getPublicUrl(filePath)
      imagen_url = urlData.publicUrl
    }

    const tecArray = tecnologias.split(',').map(t => t.trim()).filter(t => t.length > 0)

    const payload = {
      titulo,
      descripcion,
      imagen_url,
      repo_url: repoUrl || null,
      demo_url: demoUrl || null,
      tecnologias: tecArray,
    }

    let resultError
    if (editingProject) {
      const { error } = await supabase.from('proyectos').update(payload).eq('id', editingProject.id)
      resultError = error
    } else {
      const { error } = await supabase.from('proyectos').insert([payload])
      resultError = error
    }

    if (resultError) {
      setFormError('Error al guardar: ' + resultError.message)
    } else {
      showNotification(editingProject ? 'Proyecto actualizado correctamente.' : 'Proyecto publicado exitosamente.')
      setIsFormOpen(false)
      resetForm()
      fetchProjects()
    }
    setSaving(false)
  }

  const confirmDelete = async () => {
    if (!deletingProject) return
    const { error } = await supabase.from('proyectos').delete().eq('id', deletingProject.id)
    if (error) {
      showNotification('Error al eliminar: ' + error.message, 'error')
    } else {
      showNotification('Proyecto eliminado del portafolio.')
      fetchProjects()
    }
    setDeletingProject(null)
  }

  return (
    <div className="glass-card mb-12 rounded-lg p-6 relative z-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-headline text-2xl font-bold uppercase tracking-widest italic text-primary-container">
            Portafolio de Proyectos
          </h2>
          <p className="text-sm font-light text-on-surface-variant">
            Gestiona los proyectos que se muestran en la Landing Page.
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="rounded bg-primary-container px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-primary-container shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all hover:bg-primary-fixed"
        >
          + Nuevo Proyecto
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center font-mono text-sm text-on-surface-variant">Cargando proyectos...</div>
      ) : projects.length === 0 ? (
        <div className="py-8 text-center font-mono text-sm text-on-surface-variant">No hay proyectos publicados aún.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="group overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container-low transition-all hover:border-primary-container/30">
              {p.imagen_url && (
                <div className="h-40 w-full overflow-hidden">
                  <img src={p.imagen_url} alt={p.titulo} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
              )}
              <div className="p-4">
                <h3 className="mb-1 font-bold text-on-surface">{p.titulo}</h3>
                <p className="mb-3 text-xs font-light text-on-surface-variant line-clamp-2">{p.descripcion}</p>
                {p.tecnologias && p.tecnologias.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {p.tecnologias.map(t => (
                      <span key={t} className="rounded bg-primary-container/10 px-1.5 py-0.5 font-mono text-[9px] text-primary-container">{t}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 border-t border-outline-variant/10 pt-3">
                  <button onClick={() => openEditForm(p)} className="text-xs text-primary-container hover:text-primary-fixed">Editar</button>
                  <button onClick={() => setDeletingProject(p)} className="text-xs text-error hover:text-[#ff897d]">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-outline-variant/30 bg-surface-container p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline text-xl font-bold text-primary-container">
                {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h3>
              <button onClick={() => { setIsFormOpen(false); resetForm() }} className="text-on-surface-variant hover:text-on-surface">✕</button>
            </div>

            {formError && (
              <div className="mb-4 rounded border border-error/50 bg-error-container/20 p-3 text-sm text-error">{formError}</div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-on-surface-variant">Título *</label>
                <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)}
                  className="terminal-glow w-full rounded border border-outline-variant/30 bg-surface px-3 py-2 text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:outline-none"
                  placeholder="Ej: Sistema de Gestión Estudiantil" />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-on-surface-variant">Descripción</label>
                <textarea rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  className="terminal-glow w-full rounded border border-outline-variant/30 bg-surface px-3 py-2 text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:outline-none"
                  placeholder="Breve descripción del proyecto..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-on-surface-variant">Link a GitHub</label>
                  <input type="url" value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                    className="terminal-glow w-full rounded border border-outline-variant/30 bg-surface px-3 py-2 text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:outline-none"
                    placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-on-surface-variant">Link a Demo</label>
                  <input type="url" value={demoUrl} onChange={e => setDemoUrl(e.target.value)}
                    className="terminal-glow w-full rounded border border-outline-variant/30 bg-surface px-3 py-2 text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:outline-none"
                    placeholder="https://mi-demo.vercel.app" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-on-surface-variant">Tecnologías (separadas por coma)</label>
                <input type="text" value={tecnologias} onChange={e => setTecnologias(e.target.value)}
                  className="terminal-glow w-full rounded border border-outline-variant/30 bg-surface px-3 py-2 text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:outline-none"
                  placeholder="React, Node.js, Python..." />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-on-surface-variant">Imagen de Portada</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                  className="w-full cursor-pointer rounded border border-outline-variant/30 bg-surface-container-low px-3 py-2 font-mono text-sm text-on-surface transition-all hover:bg-surface-container focus:outline-none" />
                {editingProject?.imagen_url && !imageFile && (
                  <p className="mt-1 text-xs text-on-surface-variant/60">Ya tiene imagen. Selecciona una nueva solo si quieres reemplazarla.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setIsFormOpen(false); resetForm() }}
                  className="rounded px-4 py-2 font-mono text-sm uppercase text-on-surface-variant hover:text-on-surface">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="rounded bg-primary-container px-6 py-2 font-bold uppercase tracking-widest text-on-primary-container shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all hover:bg-primary-fixed disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in-up overflow-hidden rounded-lg border border-error/20 bg-surface shadow-2xl">
            <div className="bg-error-container/10 p-6 text-center">
              <span className="material-symbols-outlined mb-4 text-5xl text-error">warning</span>
              <h3 className="mb-2 font-headline text-2xl font-bold uppercase tracking-widest text-error">¿Eliminar Proyecto?</h3>
              <p className="font-light text-on-surface-variant">
                Estás a punto de eliminar <strong className="text-on-surface">{deletingProject.titulo}</strong> del portafolio. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-4 border-t border-outline-variant/10 bg-surface-container-low p-6">
              <button onClick={() => setDeletingProject(null)}
                className="flex-1 rounded border border-outline-variant/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface transition-all hover:bg-surface-container-high">
                Cancelar
              </button>
              <button onClick={confirmDelete}
                className="flex-1 rounded bg-error px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-error shadow-[0_0_15px_rgba(255,89,86,0.3)] transition-all hover:bg-[#ff897d]">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-[200] flex max-w-sm items-center gap-3 rounded-lg border px-5 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          notification.show ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
        } ${
          notification.type === 'error'
            ? 'border-error/30 bg-error-container/95 text-error backdrop-blur-md'
            : 'border-primary-container/30 bg-surface-container-high/95 text-primary-container backdrop-blur-md'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">{notification.type === 'error' ? 'error' : 'task_alt'}</span>
        <div className="flex flex-col">
          <strong className="font-headline text-sm uppercase tracking-widest text-on-surface">
            {notification.type === 'error' ? 'Error' : 'Notificación'}
          </strong>
          <span className="font-body text-xs mt-0.5 text-on-surface-variant leading-relaxed">{notification.message}</span>
        </div>
        <button onClick={() => setNotification(n => ({ ...n, show: false }))}
          className="absolute right-2 top-2 rounded p-1 hover:bg-white/10 text-on-surface-variant transition-colors">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  )
}
