import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LayoutHeader from '../components/LayoutHeader'
import LayoutFooter from '../components/LayoutFooter'
import ActivityList from '../components/ActivityList'
import ProjectUpload from '../components/ProjectUpload'
import MemberList from '../components/MemberList'
import ScheduleManager from '../components/ScheduleManager'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="scrollbar-codeclub min-h-screen bg-surface text-on-surface font-body">
      <LayoutHeader />

      <main className="pt-24 pb-32">
        <section className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-center justify-between border-b border-outline-variant/20 pb-6 pt-12">
            <div>
              <p className="mb-2 font-label text-xs uppercase tracking-[0.4em] text-primary-container opacity-80">
                System.Admin()
              </p>
              <h1 className="font-headline text-4xl font-bold leading-tight tracking-tighter md:text-5xl">
                Panel de Control
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded border border-error/50 px-4 py-2 font-mono text-xs uppercase tracking-widest text-error transition-all hover:bg-error-container/20"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="mb-12">
            <MemberList />
          </div>
          
          <div className="mb-12">
            <ScheduleManager />
          </div>

          <div className="mb-12">
            <ActivityList />
          </div>

          <div className="mb-12">
            <ProjectUpload />
          </div>

        </section>
      </main>

      <LayoutFooter />
    </div>
  )
}
