import { Link } from 'react-router-dom'

function LayoutHeader() {
  return (
    <nav className="fixed top-0 z-50 mx-auto flex w-full max-w-full items-center justify-between border-b border-[#00FF9D]/10 bg-[#131313]/60 px-8 py-4 shadow-[0_0_40px_rgba(0,255,157,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-full items-center justify-between">
        <Link className="group flex items-center gap-3" to="/">
          <span className="material-symbols-outlined text-2xl text-[#00FF9D] transition-transform group-hover:rotate-12">
            terminal
          </span>
          <span className="font-headline text-2xl italic tracking-tight text-[#00FF9D]">
            Club de desarrollo de proyectos tecnologicos
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            className="bg-[#00FF9D] px-6 py-2 font-label text-xs font-bold uppercase tracking-widest text-[#002110] transition-transform hover:scale-95 active:scale-90"
            to="/registrocode"
          >
            Unete al Club
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default LayoutHeader
