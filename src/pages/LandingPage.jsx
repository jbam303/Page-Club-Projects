import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LayoutHeader from '../components/LayoutHeader'
import LayoutFooter from '../components/LayoutFooter'

function LandingPage() {
  const [activities, setActivities] = useState([])
  const [schedules, setSchedules] = useState([])

  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await supabase
        .from('activities')
        .select('*')
        .order('id', { ascending: true })
      if (data) setActivities(data)
    }
    const fetchSchedules = async () => {
      const { data } = await supabase
        .from('horarios_club')
        .select('*')
        .order('dia', { ascending: true })
      if (data) setSchedules(data)
    }
    fetchActivities()
    fetchSchedules()
  }, [])
  return (
    <div className="scrollbar-codeclub bg-surface text-on-surface font-body">
      <LayoutHeader />

      <main className="pt-24">
        <section className="relative flex min-h-[921px] flex-col items-center justify-center overflow-hidden px-6">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
            <div className="absolute left-1/4 top-1/4 select-none font-mono text-[10rem] text-primary-container/10">
              {'{ }'}
            </div>
            <div className="absolute bottom-1/4 right-1/4 select-none font-mono text-[12rem] text-primary-container/10">
              {'>_'}
            </div>
          </div>
          <div className="z-10 mx-auto max-w-4xl text-center">
            <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-primary-container opacity-80">
              System.Initialize(Community)
            </p>
            <h1 className="mb-8 font-headline text-5xl font-bold leading-tight tracking-tighter md:text-8xl">
              Donde el código <br />
              <span className="italic text-primary-fixed">cobra vida</span>
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg font-light text-on-surface-variant md:text-xl">
              Aprende, colabora y crea proyectos reales. El club de programación
              más activo para mentes que no se detienen.
            </p>
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link
                className="w-full rounded-md bg-gradient-to-r from-primary-fixed to-secondary-fixed-dim px-10 py-4 text-xs font-bold uppercase tracking-widest text-on-primary-fixed shadow-[0_0_30px_rgba(0,255,157,0.2)] transition-all hover:shadow-[0_0_40px_rgba(0,255,157,0.4)] sm:w-auto"
                to="/registrocode"
              >
                Únete al Club
              </Link>
            </div>
          </div>

          <div className="glass-card mt-24 flex items-center gap-6 rounded-lg border border-outline-variant/10 p-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">
                schedule
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Disponibilidad
              </span>
            </div>
            <div className="flex flex-col gap-3 border-l border-outline-variant/20 pl-6">
              {schedules.length > 0 ? (
                schedules.map((sch) => (
                  <div key={sch.id} className="font-mono text-xs">
                    <span className="text-primary-fixed block mb-1">{sch.dia}: {sch.horas}</span>
                    <span className="text-on-surface-variant/70 text-[10px]">📍 {sch.lugar}</span>
                  </div>
                ))
              ) : (
                <div className="font-mono text-xs text-primary-fixed">
                  Esperando horarios...
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ACTIVIDADES MOVIDAS AQUÍ ARRIBA */}
        <section className="bg-surface-container-lowest px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 flex items-center gap-4">
              <div className="h-px w-12 bg-primary-container" />
              <h2 className="font-headline text-3xl font-bold uppercase tracking-widest italic">
                Actividades_Log
              </h2>
            </div>
            <div className="overflow-hidden rounded-lg border border-outline-variant/10 bg-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-high px-6 py-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                  <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                  <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
                </div>
                <span className="font-mono text-[10px] text-on-surface-variant/40">
                  schedule.json
                </span>
              </div>
              <div className="space-y-8 p-8">
                {activities.length > 0 ? (
                  activities.map((act, index) => {
                    const isCompleted = act.estado === 'Completado'
                    const isLast = index === activities.length - 1
                    
                    return (
                      <div key={act.id} className="flex items-start gap-6">
                        <div className="flex flex-col items-center">
                          <span
                            className={`material-symbols-outlined rounded ${
                              isCompleted 
                                ? "bg-primary-container/10 p-2 text-primary-container" 
                                : "border border-outline-variant/20 p-2 text-on-surface-variant/20"
                            }`}
                            style={isCompleted ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            {isCompleted ? 'check_circle' : (act.estado === 'En progreso' ? 'more_horiz' : 'radio_button_unchecked')}
                          </span>
                          {!isLast && (
                            <div className={`my-2 h-12 w-px ${isCompleted ? 'bg-primary-container/20' : 'bg-outline-variant/10'}`} />
                          )}
                        </div>
                        <div>
                          <div className={`mb-1 font-mono text-[10px] uppercase tracking-widest text-primary-container/70 ${isCompleted ? 'opacity-40' : ''}`}>
                            {act.fecha_evento ? new Date(act.fecha_evento).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Próximamente...'}
                          </div>
                          <h4 className={`mb-1 font-bold text-on-surface ${isCompleted ? 'line-through opacity-60' : ''}`}>
                            {act.titulo}
                            {act.lugar && (
                              <span className="ml-3 inline-block rounded bg-surface-container-high border border-outline-variant/20 px-2 py-0.5 font-mono text-[9px] font-normal uppercase tracking-wider text-primary-container/80">
                                📍 {act.lugar}
                              </span>
                            )}
                          </h4>
                          <p className={`text-sm font-light text-on-surface-variant ${isCompleted ? 'line-through opacity-60' : ''}`}>
                            {act.descripcion}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center font-mono text-sm text-on-surface-variant">Esperando nuevos logs del sistema...</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-32">
          <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <h2 className="mb-12 font-headline text-4xl font-bold leading-none md:text-6xl">
                Nuestra <br />
                <span className="text-primary-container">Misión</span>
              </h2>
              <p className="mb-8 text-xl font-light leading-relaxed text-on-surface-variant">
                Fomentar una comunidad activa e inclusiva donde el intercambio
                de conocimiento sea el motor principal. Rompemos las barreras de
                entrada al mundo tecnológico.
              </p>
            </div>
            <div className="flex justify-center py-12 md:col-span-2 md:py-0">
              <div className="hidden h-full w-px bg-gradient-to-b from-transparent via-primary-container/30 to-transparent md:block" />
            </div>
            <div className="md:col-span-5 md:pt-32">
              <h2 className="mb-12 text-right font-headline text-4xl font-bold leading-none md:text-left md:text-6xl">
                <span className="text-primary-container">Visión</span> <br />
                Futura
              </h2>
              <p className="text-right text-xl font-light leading-relaxed text-on-surface-variant md:text-left">
                Convertirnos en un referente de innovación tecnológica a nivel
                regional, incubando talento que transforme la industria a través
                de la colaboración abierta.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16">
              <span className="font-label text-xs uppercase tracking-[0.4em] text-primary-container">
                Declaración de principios
              </span>
              <h2 className="mt-4 font-headline text-4xl font-bold">
                Lo que NO somos
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="group border-l-4 border-primary-container/20 bg-surface-container p-12 transition-all hover:border-primary-container">
                <span className="material-symbols-outlined mb-6 block text-4xl text-primary-container transition-transform group-hover:scale-110">
                  sports_esports
                </span>
                <h3 className="mb-4 font-headline text-2xl italic">
                  No es un espacio de juego
                </h3>
                <p className="leading-relaxed text-on-surface-variant">
                  Aunque disfrutamos lo que hacemos, nos enfocamos en el
                  crecimiento profesional y técnico. Aquí venimos a construir el
                  futuro, un commit a la vez.
                </p>
              </div>
              <div className="group border-l-4 border-primary-container/20 bg-surface-container p-12 transition-all hover:border-primary-container">
                <span className="material-symbols-outlined mb-6 block text-4xl text-primary-container transition-transform group-hover:scale-110">
                  psychology_alt
                </span>
                <h3 className="mb-4 font-headline text-2xl italic">
                  No es un lugar donde equivocarse sea malo
                </h3>
                <p className="leading-relaxed text-on-surface-variant">
                  El error es nuestro mejor compilador. Valoramos el aprendizaje
                  que nace del fallo y la iteración constante sobre la
                  perfección estática.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-32">
          <div className="mb-24 flex flex-col items-end justify-between gap-8 md:flex-row">
            <div>
              <span className="font-label text-xs uppercase tracking-[0.4em] text-primary-container">
                Roadmap 2026
              </span>
              <h2 className="mt-4 font-headline text-5xl font-bold md:text-7xl">
                Nuestras Metas
              </h2>
            </div>
            <div className="text-right font-mono text-xs uppercase tracking-widest text-primary-container/40">
              [ STATUS: ACTIVE ]
            </div>
          </div>
          <div className="space-y-1">
            <div className="group flex flex-col justify-between border-t border-outline-variant/10 px-4 py-12 transition-all hover:bg-surface-container-low md:flex-row md:items-center">
              <span className="mb-4 font-mono text-sm text-primary-container/30 md:mb-0">
                01 / EVENTO
              </span>
              <h3 className="font-headline text-3xl transition-transform group-hover:translate-x-4 md:text-5xl">
                Hackaton Anual
              </h3>
              <span className="material-symbols-outlined opacity-0 transition-opacity text-primary-container group-hover:opacity-100">

              </span>
            </div>
            <div className="group flex flex-col justify-between border-t border-outline-variant/10 px-4 py-12 transition-all hover:bg-surface-container-low md:flex-row md:items-center">
              <span className="mb-4 font-mono text-sm text-primary-container/30 md:mb-0">
                02 / SOCIAL
              </span>
              <h3 className="font-headline text-3xl transition-transform group-hover:translate-x-4 md:text-5xl">
                Vinculación con el Medio
              </h3>
              <span className="material-symbols-outlined opacity-0 transition-opacity text-primary-container group-hover:opacity-100">

              </span>
            </div>
            <div className="group flex flex-col justify-between border-b border-t border-outline-variant/10 px-4 py-12 transition-all hover:bg-surface-container-low md:flex-row md:items-center">
              <span className="mb-4 font-mono text-sm text-primary-container/30 md:mb-0">
                03 / FUNDING
              </span>
              <h3 className="font-headline text-3xl transition-transform group-hover:translate-x-4 md:text-5xl">
                Fondo Concursable
              </h3>
              <span className="material-symbols-outlined opacity-0 transition-opacity text-primary-container group-hover:opacity-100">

              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-32 text-center">
          <h2 className="mb-16 font-headline text-4xl font-bold italic md:text-5xl">
            Código de <span className="text-primary-container">Conducta</span>
          </h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="space-y-4">
              <h3 className="font-label text-xs font-black uppercase tracking-widest text-primary-container">
                Respeto
              </h3>
              <p className="font-light text-on-surface-variant">
                Tratamos a todos con dignidad, independientemente de su nivel de
                experiencia.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-label text-xs font-black uppercase tracking-widest text-primary-container">
                Diversidad
              </h3>
              <p className="font-light text-on-surface-variant">
                Celebramos las diferentes perspectivas que enriquecen nuestra
                comunidad técnica.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-label text-xs font-black uppercase tracking-widest text-primary-container">
                Crítica Constructiva
              </h3>
              <p className="font-light text-on-surface-variant">
                Damos feedback para ayudar a crecer, no para invalidar el
                trabajo ajeno.
              </p>
            </div>
          </div>
        </section>
      </main>

      <LayoutFooter />
    </div>
  )
}

export default LandingPage
