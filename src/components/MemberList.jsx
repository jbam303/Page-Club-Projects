import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function MemberList() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingMember, setDeletingMember] = useState(null)
  
  // UX States
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const ITEMS_PER_PAGE = 5

  const showNotification = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type })
    setTimeout(() => {
      setNotification(n => ({ ...n, show: false }))
    }, 5000)
  }

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
      showNotification('Error al eliminar: ' + error.message, 'error')
    } else {
      showNotification('Miembro eliminado del registro correctamente.', 'success')
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
      showNotification('Error al actualizar estado: ' + error.message, 'error')
    } else {
      
      if (isApproving) {
        showNotification('Procesando envío de correo...', 'success')
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
          showNotification('Usuario aprobado y correo de notificación despachado exitosamente al postulante.', 'success')
        } catch (e) {
          console.error('Error enviando correo:', e)
          showNotification('Aprobado con Error: falló el envío del correo automático. (Posible límite de Resend)', 'error')
        }
      } else {
        showNotification('El estado del miembro ha sido revertido a Pendiente.', 'success')
      }
      
      fetchMembers()
    }
  }

  // Derive data logic
  const filteredMembers = members.filter(m => {
    const searchLow = searchTerm.toLowerCase()
    return (
      (m.nombre_completo || '').toLowerCase().includes(searchLow) ||
      (m.email || '').toLowerCase().includes(searchLow) ||
      (m.rut || '').toLowerCase().includes(searchLow)
    )
  })

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE) || 1
  const displayedMembers = filteredMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Reset to page 1 if search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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

      <div className="mb-6 flex w-full flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar postulantes por Nombre, Correo o RUT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="terminal-glow w-full rounded border border-outline-variant/30 bg-surface py-3 pl-10 pr-4 text-sm text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:outline-none"
          />
        </div>
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
      ) : filteredMembers.length === 0 ? (
        <div className="py-8 text-center font-mono text-sm text-on-surface-variant">
          No hay miembros que coincidan con la búsqueda.
        </div>
      ) : (
        <>
          {/* Vista móvil (Tarjetas) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {displayedMembers.map((member) => (
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
                {displayedMembers.map((member) => (
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row border-t border-outline-variant/20 pt-4">
              <span className="font-mono text-xs uppercase text-on-surface-variant">
                Página <strong className="text-on-surface">{currentPage}</strong> de <strong className="text-on-surface">{totalPages}</strong> ({filteredMembers.length} resultados)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="rounded border border-outline-variant/30 bg-surface-container px-3 py-1 font-mono text-xs uppercase text-on-surface disabled:opacity-30 transition-all hover:bg-surface-container-high"
                >
                  Anterior
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="rounded border border-outline-variant/30 bg-surface-container px-3 py-1 font-mono text-xs uppercase text-on-surface disabled:opacity-30 transition-all hover:bg-surface-container-high"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
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

      {/* Modern Aesthetic Notification Toast (Modal) */}
      <div 
        className={`fixed bottom-6 right-6 z-[200] flex max-w-sm items-center gap-3 rounded-lg border px-5 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          notification.show ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
        } ${
          notification.type === 'error' 
            ? 'border-error/30 bg-error-container/95 text-error backdrop-blur-md' 
            : 'border-primary-container/30 bg-surface-container-high/95 text-primary-container backdrop-blur-md'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">
          {notification.type === 'error' ? 'error' : 'task_alt'}
        </span>
        <div className="flex flex-col">
          <strong className="font-headline text-sm uppercase tracking-widest text-on-surface">
            {notification.type === 'error' ? 'Error' : 'Notificación'}
          </strong>
          <span className="font-body text-xs mt-0.5 text-on-surface-variant leading-relaxed">
            {notification.message}
          </span>
        </div>
        <button 
          onClick={() => setNotification(n => ({ ...n, show: false }))}
          className="absolute right-2 top-2 rounded p-1 hover:bg-white/10 text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  )
}
