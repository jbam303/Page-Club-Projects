import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function MemberList() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMembers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('miembros')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) {
      setError('Error al cargar miembros.')
    } else {
      setMembers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar a este miembro del club?')) return
    
    const { error } = await supabase.from('miembros').delete().eq('id', id)
    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      fetchMembers()
    }
  }

  const handleToggleStatus = async (member) => {
    const isApproving = member.estado !== 'aprobado'
    const newStatus = isApproving ? 'aprobado' : 'pendiente'
    const { error } = await supabase.from('miembros').update({ estado: newStatus }).eq('id', member.id)
    if (error) {
      alert('Error al actualizar estado: ' + error.message)
    } else {
      
      if (isApproving) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const token = session?.access_token || ''

          const res = await fetch('/api/sendEmail', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email: member.email, name: member.nombre_completo, status: 'aprobado' })
          })

          if (!res.ok) {
            throw new Error('No autorizado o falló el envío')
          }
          alert('Usuario aprobado y correo de notificación despachado (o simulado, revisa la consola del server si usas el modo local sin API).')
        } catch (e) {
          console.error('Error enviando correo', e)
          alert('Estado aprobado, pero falló el envío del correo automático.')
        }
      }
      
      fetchMembers()
    }
  }

  return (
    <div className="glass-card mb-12 rounded-lg p-6 relative z-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-headline text-2xl font-bold uppercase tracking-widest italic text-primary-container">
            Registro de Miembros
          </h2>
          <p className="text-sm font-light text-on-surface-variant">
            Administra las inscripciones al club.
          </p>
        </div>
        <button
          onClick={fetchMembers}
          className="rounded border border-primary-container/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-container transition-all hover:bg-primary-container/10"
        >
          Recargar Data
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-error/50 bg-error-container/20 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center font-mono text-sm text-on-surface-variant">
          Cargando registros...
        </div>
      ) : members.length === 0 ? (
        <div className="py-8 text-center font-mono text-sm text-on-surface-variant">
          No hay miembros registrados aún.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="border-b border-outline-variant/20 bg-surface-container-high text-xs uppercase text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Intereses</th>
                <th className="px-4 py-3">Ingreso</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low">
                  <td className="px-4 py-4 font-bold">
                    <div className="flex flex-col">
                      <span>{member.nombre_completo}</span>
                      <span className="font-mono text-[10px] text-primary-container/70 mt-1">
                        RUT: {member.rut || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <a href={`mailto:${member.email}`} className="text-[#00FF9D] hover:underline">{member.email}</a>
                      {member.bio && <span className="text-xs font-light text-on-surface-variant/80 mt-1 line-clamp-2" title={member.bio}>{member.bio}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {member.intereses && member.intereses.map(i => (
                        <span key={i} className="rounded bg-surface-container-high border border-outline-variant/20 px-1.5 py-0.5 font-mono text-[9px] text-on-surface-variant">
                          {i}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-[10px] uppercase text-primary-container/70">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded px-2 py-1 font-mono text-[10px] ${member.estado === 'aprobado' ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'bg-primary-container/10 text-primary-container'}`}>
                      {member.estado || 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(member)}
                      className="mr-3 text-[#00FF9D] hover:text-[#00cc7d]"
                      title={member.estado === 'aprobado' ? 'Marcar pendiente' : 'Aprobar acceso'}
                    >
                      {member.estado === 'aprobado' ? 'Revertir' : 'Aprobar'}
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-error hover:text-[#ff897d]"
                      title="Eliminar registro"
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
    </div>
  )
}
