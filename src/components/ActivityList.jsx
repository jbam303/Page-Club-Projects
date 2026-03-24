import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ActivityForm from './ActivityForm'

export default function ActivityList() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)

  const fetchActivities = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      
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

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta actividad?')) return
    
    const { error } = await supabase.from('activities').delete().eq('id', id)
    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      fetchActivities()
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

  return (
    <div className="glass-card mb-12 rounded-lg p-6">
      <div className="mb-6 flex items-center justify-between">
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
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => (
                <tr key={act.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-4 font-bold">{act.title}</td>
                  <td className="px-4 py-4 font-light text-on-surface-variant">{act.description}</td>
                  <td className="px-4 py-4">
                    <span className="rounded bg-primary-container/10 px-2 py-1 font-mono text-[10px] text-primary-container">
                      {act.status || 'Activo'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleEdit(act)}
                      className="mr-3 text-primary-container hover:text-primary-fixed"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(act.id)}
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
    </div>
  )
}
