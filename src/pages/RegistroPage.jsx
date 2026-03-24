import { Link } from 'react-router-dom'
import LayoutHeader from '../components/LayoutHeader'
import LayoutFooter from '../components/LayoutFooter'

function RegistroPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <LayoutHeader />

      <main className="relative mx-auto w-full max-w-4xl flex-grow px-6 pb-40 pt-48">
        <section className="animate-fade-in-up mb-20">
          <div className="mb-6 inline-block border-l-2 border-primary-container bg-primary-container/5 px-3 py-1">
            <span className="font-body text-[10px] uppercase tracking-[0.4em] text-primary-container">system.status(online)</span>
          </div>
          <h1 className="mb-6 font-headline text-7xl italic leading-tight text-on-surface">
            Únete al <span className="text-primary-container">Club</span>
          </h1>
          <p className="max-w-2xl border-l border-outline-variant/30 pl-8 font-body text-xl leading-relaxed text-on-surface-variant/80">
            Estamos construyendo el futuro, un commit a la vez. <br />
            <span className="italic text-[#00FF9D]/60">Ingresa a la red. Comparte tus datos.</span>
          </p>
        </section>

        <form className="animate-fade-in-up animate-delay-200 max-w-2xl space-y-12 opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="group space-y-3">
            <label className="block font-body text-[10px] uppercase tracking-[0.3em] text-[#00FF9D]/60 transition-colors group-focus-within:text-[#00FF9D]">system.input(full_name)</label>
            <input className="terminal-glow w-full rounded-none border-b border-outline-variant/30 bg-transparent p-4 text-lg text-on-surface placeholder:text-on-surface-variant/20 outline-none transition-all duration-500 focus:border-[#00FF9D] focus:ring-0" placeholder="John Doe" type="text" />
          </div>

          <div className="group space-y-3">
            <label className="block font-body text-[10px] uppercase tracking-[0.3em] text-[#00FF9D]/60 transition-colors group-focus-within:text-[#00FF9D]">system.input(institutional_email)</label>
            <input className="terminal-glow w-full rounded-none border-b border-outline-variant/30 bg-transparent p-4 text-lg text-on-surface placeholder:text-on-surface-variant/20 outline-none transition-all duration-500 focus:border-[#00FF9D] focus:ring-0" placeholder="dev@university.edu" type="email" />
          </div>

          <div className="group space-y-3">
            <label className="block font-body text-[10px] uppercase tracking-[0.3em] text-[#00FF9D]/60 transition-colors group-focus-within:text-[#00FF9D]">system.input(bio)</label>
            <textarea className="terminal-glow min-h-[160px] w-full resize-none rounded-none border border-outline-variant/20 bg-transparent p-6 text-lg text-on-surface placeholder:text-on-surface-variant/20 outline-none transition-all duration-500 focus:border-[#00FF9D] focus:ring-0" placeholder="Cuéntanos un poco sobre ti y tus metas..." rows={4} />
          </div>

          <div className="space-y-6">
            <label className="block font-body text-[10px] uppercase tracking-[0.3em] text-[#00FF9D]/60">system.select(interests)</label>
            <div className="flex flex-wrap gap-3">
              <label className="group cursor-pointer"><input className="peer hidden" type="checkbox" /><span className="block border border-outline-variant/20 px-6 py-3 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant transition-all hover:border-[#00FF9D]/50 peer-checked:border-primary-container peer-checked:bg-primary-container/10 peer-checked:text-primary-container">Frontend</span></label>
              <label className="group cursor-pointer"><input className="peer hidden" defaultChecked type="checkbox" /><span className="block border border-outline-variant/20 px-6 py-3 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant transition-all hover:border-[#00FF9D]/50 peer-checked:border-primary-container peer-checked:bg-primary-container/10 peer-checked:text-primary-container">Backend</span></label>
              <label className="group cursor-pointer"><input className="peer hidden" type="checkbox" /><span className="block border border-outline-variant/20 px-6 py-3 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant transition-all hover:border-[#00FF9D]/50 peer-checked:border-primary-container peer-checked:bg-primary-container/10 peer-checked:text-primary-container">Videojuegos</span></label>
              <label className="group cursor-pointer"><input className="peer hidden" type="checkbox" /><span className="block border border-outline-variant/20 px-6 py-3 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant transition-all hover:border-[#00FF9D]/50 peer-checked:border-primary-container peer-checked:bg-primary-container/10 peer-checked:text-primary-container">Ciberseguridad</span></label>
              <label className="group cursor-pointer"><input className="peer hidden" type="checkbox" /><span className="block border border-outline-variant/20 px-6 py-3 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant transition-all hover:border-[#00FF9D]/50 peer-checked:border-primary-container peer-checked:bg-primary-container/10 peer-checked:text-primary-container">IA</span></label>
            </div>
          </div>

          <div className="pt-12">
            <button className="group relative w-full max-w-sm overflow-hidden bg-gradient-to-r from-[#56ffa8] to-[#00e475] py-6 text-xs font-bold uppercase tracking-[0.3em] text-[#002110] shadow-[0_20px_40px_-10px_rgba(0,255,157,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,255,157,0.4)] active:scale-[0.98]" type="button">
              <span className="relative z-10">Enviar Registro</span>
              <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
            </button>
            <div className="mt-8 flex items-center gap-3">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container" />
              <p className="font-body text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/40">Security protocol: AES-256 Enabled</p>
            </div>
          </div>
        </form>

        <div className="pointer-events-none fixed right-[5%] top-1/2 -z-10 select-none opacity-[0.03]">
          <span className="text-[400px] font-bold leading-none text-primary-container">{'{ }'}</span>
        </div>
        <div className="pointer-events-none fixed bottom-0 left-[5%] -z-10 select-none opacity-[0.02]">
          <span className="font-headline text-[300px] italic leading-none text-primary-container">Code</span>
        </div>
      </main>

      <LayoutFooter />
    </div>
  )
}

export default RegistroPage
