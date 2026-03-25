import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function MemberList() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingMember, setDeletingMember] = useState(null)

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

  const confirmDelete = async () => {
    if (!deletingMember) return
    
    const { error } = await supabase.from('miembros').delete().eq('id', deletingMember.id)
    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      fetchMembers()
    }
    setDeletingMember(null)
  }

  const handleDeleteClick = (member) => {
    setDeletingMember(member)
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
            const errData = await res.json()
            throw new Error(errData.error || 'No autorizado o falló el envío')
          }
          alert('Usuario aprobado y correo de notificación despachado exitosamente.')
        } catch (e) {
          console.error('Error enviando correo:', e)
          alert('El usuario fue aprobado, pero falló el envío del correo automático:\n\n' + e.message + '\n\n*Nota: Si estás usando la capa gratuita de Resend sin un dominio verificado, solo puedes enviarte correos a la misma dirección con la que te registraste en Resend.*')
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
        <>
          {/* Vista móvil (Tarjetas) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {members.map((member) => (
              <div key={member.id} className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[15px]">{member.nombre_completo}</h3>
                    <p className="font-mono text-[10px] text-primary-container/70">RUT: {member.rut || 'N/A'}</p>
                  </div>
                  <span className={`block rounded px-2 py-1 font-mono text-[10px] ${member.estado === 'aprobado' ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'bg-primary-container/10 text-primary-container'}`}>
                    {member.estado || 'Pendiente'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 text-sm mt-1">
                  <a href={`mailto:${member.email}`} className="text-[#00FF9D] hover:underline font-mono text-[11px] truncate">{member.email}</a>
                  {member.bio && (
                    <p className="text-sm font-light text-on-surface-variant/90 break-words mt-1 leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  {member.intereses && member.intereses.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {member.intereses.map(i => (
                        <span key={i} className="rounded bg-surface-container-high border border-outline-variant/20 px-1.5 py-0.5 font-mono text-[9px] text-on-surface-variant">
                          {i}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-outline-variant/10">
                  <span className="font-mono text-[10px] uppercase text-primary-container/70">
                    Ingreso: {new Date(member.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-4 text-xs font-bold font-mono uppercase tracking-wider">
                    <button
                      onClick={() => handleToggleStatus(member)}
                      className="text-[#00FF9D] hover:text-[#00cc7d] transition-colors"
                    >
                      {member.estado === 'aprobado' ? 'Revertir' : 'Aprobar'}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(member)}
                      className="text-error hover:text-[#ff897d] transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vista desktop (Tabla) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-on-surface">
              <thead className="border-b border-outline-variant/20 bg-surface-container-high text-xs uppercase text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3 min-w-[300px]">Contacto / Bio</th>
                  <th className="px-4 py-3 min-w-[200px]">Intereses</th>
                  <th className="px-4 py-3">Ingreso</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right text-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-4 font-bold align-top">
                      <div className="flex flex-col">
                        <span>{member.nombre_completo}</span>
                        <span className="font-mono text-[10px] text-primary-container/70 mt-1">
                          RUT: {member.rut || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <a href={`mailto:${member.email}`} className="text-[#00FF9D] hover:underline w-fit">{member.email}</a>
                        {member.bio && <span className="text-sm font-light text-on-surface-variant/90 break-words leading-relaxed max-w-sm">{member.bio}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-1">
                        {member.intereses && member.intereses.map(i => (
                          <span key={i} className="rounded bg-surface-container-high border border-outline-variant/20 px-1.5 py-0.5 font-mono text-[9px] text-on-surface-variant">
                            {i}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-[10px] uppercase text-primary-container/70 align-top pt-5">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 align-top pt-4">
                      <span className={`rounded px-2 py-1 font-mono text-[10px] ${member.estado === 'aprobado' ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'bg-primary-container/10 text-primary-container'}`}>
                        {member.estado || 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right align-top pt-4">
                      <div className="flex justify-end gap-3 flex-wrap">
                        <button
                          onClick={() => handleToggleStatus(member)}
                          className="mr-2 text-[#00FF9D] hover:text-[#00cc7d] whitespace-nowrap"
                          title={member.estado === 'aprobado' ? 'Marcar pendiente' : 'Aprobar acceso'}
                        >
                          {member.estado === 'aprobado' ? 'Revertir' : 'Aprobar'}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member)}
                          className="text-error hover:text-[#ff897d] whitespace-nowrap"
                          title="Eliminar registro"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in-up overflow-hidden rounded-lg border border-error/20 bg-surface shadow-2xl">
            <div className="bg-error-container/10 p-6 text-center">
              <span className="material-symbols-outlined mb-4 text-5xl text-error">
                warning
              </span>
              <h3 className="mb-2 font-headline text-2xl font-bold uppercase tracking-widest text-error">
                ¿Eliminar Miembro?
              </h3>
              <p className="font-light text-on-surface-variant">
                Estás a punto de eliminar a <strong className="text-on-surface">{deletingMember.nombre_completo}</strong> del sistema. Esta acción no se puede deshacer y borrará todos sus registros.
              </p>
            </div>
            <div className="flex gap-4 border-t border-outline-variant/10 bg-surface-container-low p-6">
              <button
                onClick={() => setDeletingMember(null)}
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
