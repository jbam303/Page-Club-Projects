import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ScheduleManager() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Form State
  const [dia, setDia] = useState('Lunes')
  const [horas, setHoras] = useState('')
  const [lugar, setLugar] = useState('')

  // Delete State
  const [deletingSchedule, setDeletingSchedule] = useState(null)

  const fetchSchedules = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('horarios_club')
      .select('*')
      .order('dia', { ascending: true })
      
    if (error) {
      setError('Error al cargar horarios.')
    } else {
      setSchedules(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    
    if (!horas || !lugar) {
      alert("Debes completar horas y lugar")
      return
    }

    const { error } = await supabase.from('horarios_club').insert([{
      dia,
      horas,
      lugar
    }])

    if (error) {
      alert('Error al guardar: ' + error.message)
    } else {
      setHoras('')
      setLugar('')
      fetchSchedules()
    }
  }

  const confirmDelete = async () => {
    if (!deletingSchedule) return
    
    const { error } = await supabase.from('horarios_club').delete().eq('id', deletingSchedule.id)
    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      fetchSchedules()
    }
    setDeletingSchedule(null)
  }

  return (
    <div className={`glass-card mb-12 rounded-lg p-6 relative z-10`}>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-headline text-2xl font-bold uppercase tracking-widest italic text-primary-container">
            Gestión de Horarios
          </h2>
          <p className="text-sm font-light text-on-surface-variant">
            Configura qué días y dónde se reúne el club.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-error/50 bg-error-container/20 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4 items-end">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary-container">Día</label>
          <select value={dia} onChange={(e) => setDia(e.target.value)} className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary-container">
            <option>Lunes</option>
            <option>Martes</option>
            <option>Miércoles</option>
            <option>Jueves</option>
            <option>Viernes</option>
            <option>Sábado</option>
            <option>Domingo</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary-container">Horas</label>
          <input required value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="Ej: 11:00 AM - 6:00 PM" className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary-container" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary-container">Lugar</label>
          <input required value={lugar} onChange={(e) => setLugar(e.target.value)} placeholder="Ej: Sala 204" className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary-container" />
        </div>
        <div>
          <button type="submit" className="w-full rounded bg-primary-container px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-primary-container shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all hover:bg-primary-fixed">
            Añadir
          </button>
        </div>
      </form>

      {loading ? (
        <div className="py-8 text-center font-mono text-sm text-on-surface-variant">
          Cargando horarios...
        </div>
      ) : schedules.length === 0 ? (
        <div className="py-8 text-center font-mono text-sm text-on-surface-variant">
          No hay horarios configurados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="border-b border-outline-variant/20 bg-surface-container-high text-xs uppercase text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Día</th>
                <th className="px-4 py-3">Rango de Horas</th>
                <th className="px-4 py-3">Lugar Físico / Virtual</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((sch) => (
                <tr key={sch.id} className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low">
                  <td className="px-4 py-4 font-bold">{sch.dia}</td>
                  <td className="px-4 py-4 font-light text-on-surface-variant">{sch.horas}</td>
                  <td className="px-4 py-4 font-mono text-[10px] uppercase text-primary-container/70">{sch.lugar}</td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setDeletingSchedule(sch)}
                      className="text-error hover:text-[#ff897d]"
                      title="Eliminar Horario"
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

      {/* Delete Confirmation Modal */}
      {deletingSchedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in-up overflow-hidden rounded-lg border border-error/20 bg-surface shadow-2xl">
            <div className="bg-error-container/10 p-6 text-center">
              <span className="material-symbols-outlined mb-4 text-5xl text-error">
                warning
              </span>
              <h3 className="mb-2 font-headline text-2xl font-bold uppercase tracking-widest text-error">
                ¿Eliminar Horario?
              </h3>
              <p className="font-light text-on-surface-variant">
                Estás a punto de borrar el horario del <strong className="text-on-surface">{deletingSchedule.dia}</strong>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-4 border-t border-outline-variant/10 bg-surface-container-low p-6">
              <button
                onClick={() => setDeletingSchedule(null)}
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
