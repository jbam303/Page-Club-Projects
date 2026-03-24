function LayoutFooter() {
  return (
    <footer className="w-full border-t border-[#3B4A3F]/15 bg-[#0E0E0E] py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-12 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <div className="text-sm font-black text-[#00FF9D]">
            Club de desarrollo de proyectos tecnologicos
          </div>
          <p className="font-mono text-[10px] uppercase leading-relaxed tracking-widest text-[#E5E2E1]/40">
            © 2026 Club de desarrollo de proyectos tecnologicos. ALL RIGHTS
            RESERVED.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[#00FF9D]">
            Comunidad
          </h4>
          <a
            className="font-mono text-[10px] uppercase tracking-widest text-[#E5E2E1]/40 opacity-80 transition-colors duration-200 hover:text-[#00FF9D] hover:opacity-100"
            href="#"
          >
            GitHub
          </a>
          <a
            className="font-mono text-[10px] uppercase tracking-widest text-[#E5E2E1]/40 opacity-80 transition-colors duration-200 hover:text-[#00FF9D] hover:opacity-100"
            href="#"
          >
            Discord
          </a>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <h4 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[#00FF9D]">
            Administracion
          </h4>
          <a
            className="inline-flex items-center gap-2 border border-[#00FF9D]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[#00FF9D] opacity-80 transition-all hover:bg-[#00FF9D]/5 hover:opacity-100"
            href="#"
          >
            <span className="material-symbols-outlined text-xs">
              admin_panel_settings
            </span>
            Admin Access
          </a>
        </div>
      </div>
    </footer>
  )
}

export default LayoutFooter
