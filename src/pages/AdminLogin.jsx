import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Credenciales inválidas o error en el servidor.')
      setLoading(false)
    } else {
      navigate('/admin/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4 font-mono text-on-surface">
      <div className="w-full max-w-md rounded-lg border border-outline-variant/30 bg-surface-container-low p-8 shadow-[0_0_30px_rgba(0,255,157,0.1)]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-primary-container">
            Admin_Acceso
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Sistema de Gestión Code Club
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded border border-error/50 bg-error-container/20 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-primary-container/80">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="terminal-glow w-full rounded border border-outline-variant/30 bg-surface px-4 py-2 text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:outline-none"
              placeholder="admin@codeclub.cl"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-primary-container/80">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="terminal-glow w-full rounded border border-outline-variant/30 bg-surface px-4 py-2 text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary-container py-3 font-bold uppercase tracking-widest text-on-primary-container shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all hover:bg-primary-fixed disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
