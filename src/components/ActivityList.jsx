import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ActivityForm from './ActivityForm'

export default function ActivityList() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [deletingActivity, setDeletingActivity] = useState(null)
  const [sendingReminderId, setSendingReminderId] = useState(null)

  const fetchActivities = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('id', { ascending: false })
      
    if (error) {
      setError('Error al cargar actividades.')
    } else {
      setActivities(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActivities()
  }, [])

  const confirmDelete = async () => {
    if (!deletingActivity) return
    
    const { error } = await supabase.from('activities').delete().eq('id', deletingActivity.id)
    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      fetchActivities()
    }
    setDeletingActivity(null)
  }

  const handleDeleteClick = (act) => {
    setDeletingActivity(act)
  }

  const handleToggleStatus = async (act) => {
    const newStatus = act.estado === 'Completado' ? 'Pendiente' : 'Completado'
    const { error } = await supabase.from('activities').update({ estado: newStatus }).eq('id', act.id)
    if (error) {
      alert('Error al actualizar estado: ' + error.message)
    } else {
      fetchActivities()
    }
  }

  const handleSendReminder = async (act) => {
    if (!window.confirm(`¿Seguro que quieres enviar un correo ahora a todos los miembros sobre "${act.titulo}"?`)) return
    
    setSendingReminderId(act.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No estás autenticado')

      const response = await fetch('/api/sendReminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ activityId: act.id })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Error enviando aviso')
      
      alert('✅ ' + result.message)
      fetchActivities()
    } catch (err) {
      alert('❌ Error: ' + err.message)
    } finally {
      setSendingReminderId(null)
    }
  }

  const handleEdit = (activity) => {
    setEditingActivity(activity)
    setIsModalOpen(true)
  }

  const handleNew = () => {
    setEditingActivity(null)
    setIsModalOpen(true)
  }

  const handleModalClose = (shouldRefresh) => {
    setIsModalOpen(false)
    setEditingActivity(null)
    if (shouldRefresh) {
      fetchActivities()
    }
  }

  const getCalendarUrl = (activity) => {
    if (!activity.fecha_evento) return "#"
    const start = new Date(activity.fecha_evento)
    const end = activity.fecha_fin ? new Date(activity.fecha_fin) : new Date(start.getTime() + 60 * 60 * 1000)

    const formatGoogleDate = (d) => {
      return d.toISOString().replace(/-|:|\.\d\d\d/g, "")
    }

    const startDateStr = formatGoogleDate(start)
    const endDateStr = formatGoogleDate(end)
    
    const title = encodeURIComponent(activity.titulo || '')
    const desc = encodeURIComponent(activity.descripcion || '')
    const loc = encodeURIComponent(activity.lugar || '')

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${desc}&location=${loc}`
  }

  const formatEventDate = (act) => {
    if (!act.fecha_evento) return 'Próximamente...'
    const startStr = new Date(act.fecha_evento).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    if (act.fecha_fin) {
      const startDate = new Date(act.fecha_evento)
      const endDate = new Date(act.fecha_fin)
      if (startDate.toDateString() !== endDate.toDateString()) {
         return `${startStr} - ${endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
      }
      return `${startStr} - ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    }
    return startStr
  }

  return (
    <div className={`glass-card mb-12 rounded-lg p-6 ${isModalOpen ? 'relative z-50' : 'relative z-10'}`}>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-headline text-2xl font-bold uppercase tracking-widest italic text-primary-container">
            Gestión de Actividades
          </h2>
          <p className="text-sm font-light text-on-surface-variant">
            Administra el log de actividades del club.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="rounded bg-primary-container px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-primary-container shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all hover:bg-primary-fixed"
        >
          + Nueva Actividad
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-error/50 bg-error-container/20 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center font-mono text-sm text-on-surface-variant">
          Cargando datos...
        </div>
      ) : activities.length === 0 ? (
        <div className="py-8 text-center font-mono text-sm text-on-surface-variant">
          No hay actividades registradas.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="border-b border-outline-variant/20 bg-surface-container-high text-xs uppercase text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Lugar</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => (
                <tr key={act.id} className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low">
                  <td className={`px-4 py-4 font-bold ${act.estado === 'Completado' ? 'line-through opacity-50' : ''}`}>{act.titulo}</td>
                  <td className={`px-4 py-4 font-light text-on-surface-variant ${act.estado === 'Completado' ? 'line-through opacity-50' : ''}`}>{act.descripcion}</td>
                  <td className={`px-4 py-4 text-xs ${act.estado === 'Completado' ? 'line-through opacity-50' : ''}`}>{act.lugar || '—'}</td>
                  <td className={`px-4 py-4 font-mono text-[10px] uppercase text-primary-container/70 ${act.estado === 'Completado' ? 'line-through opacity-50' : ''}`}>
                    {formatEventDate(act)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded px-2 py-1 font-mono text-[10px] ${act.estado === 'Completado' ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'bg-primary-container/10 text-primary-container'}`}>
                      {act.estado || 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right flex items-center justify-end gap-3">
                    {act.fecha_evento && act.estado !== 'Completado' && (
                      <a
                        href={getCalendarUrl(act)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00FF9D] hover:text-[#00cc7d]"
                        title="Añadir a Google Calendar"
                      >
                        <span className="material-symbols-outlined text-lg">calendar_add_on</span>
                      </a>
                    )}
                    {act.estado !== 'Completado' && !act.reminder_sent && (
                      <button
                        onClick={() => handleSendReminder(act)}
                        disabled={sendingReminderId === act.id}
                        className="mr-3 text-[#FFBD2E] hover:text-[#ffd666] disabled:opacity-50"
                        title="Enviar correo de aviso"
                      >
                        <span className="material-symbols-outlined text-lg">campaign</span>
                      </button>
                    )}
                    {act.reminder_sent && (
                      <span className="mr-3 text-on-surface-variant/40 cursor-not-allowed" title="Aviso ya enviado">
                        <span className="material-symbols-outlined text-lg">campaign</span>
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleStatus(act)}
                      className="mr-3 text-[#00FF9D] hover:text-[#00cc7d]"
                      title="Marcar completada"
                    >
                      {act.estado === 'Completado' ? 'Desmarcar' : 'Completar'}
                    </button>
                    <button
                      onClick={() => handleEdit(act)}
                      className="mr-3 text-primary-container hover:text-primary-fixed"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(act)}
                      className="text-error hover:text-[#ff897d]"
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <ActivityForm
          initialData={editingActivity}
          onClose={handleModalClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingActivity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in-up overflow-hidden rounded-lg border border-error/20 bg-surface shadow-2xl">
            <div className="bg-error-container/10 p-6 text-center">
              <span className="material-symbols-outlined mb-4 text-5xl text-error">
                warning
              </span>
              <h3 className="mb-2 font-headline text-2xl font-bold uppercase tracking-widest text-error">
                ¿Eliminar Actividad?
              </h3>
              <p className="font-light text-on-surface-variant">
                Estás a punto de borrar la actividad <strong className="text-on-surface">{deletingActivity.titulo}</strong> del registro. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-4 border-t border-outline-variant/10 bg-surface-container-low p-6">
              <button
                onClick={() => setDeletingActivity(null)}
                className="flex-1 rounded border border-outline-variant/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface transition-all hover:bg-surface-container-high"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded bg-error px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-error shadow-[0_0_15px_rgba(255,89,86,0.3)] transition-all hover:bg-[#ff897d]"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
