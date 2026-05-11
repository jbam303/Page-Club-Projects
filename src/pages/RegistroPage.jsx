import { useState } from 'react'
import { supabase } from '../lib/supabase'
import LayoutHeader from '../components/LayoutHeader'
import LayoutFooter from '../components/LayoutFooter'

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const validateRut = (rut) => {
  if (typeof rut !== 'string') return false
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (cleanRut.length < 2) return false

  const body = cleanRut.slice(0, -1)
  const dv = cleanRut.slice(-1)
  if (!/^[0-9]+$/.test(body)) return false

  let sum = 0
  let multiplier = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const expectedDv = 11 - (sum % 11)
  const calculatedDv =
    expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString()

  return dv === calculatedDv
}

// Lista básica de palabras inapropiadas (en minúsculas)
const OFFENSIVE_WORDS = [
  'idiota', 'imbécil', 'estúpido', 'mierda', 'puta', 'puto',
  'cabrón', 'cabron', 'pendejo', 'culiao', 'weon', 'weón',
  'maricón', 'maricon', 'concha', 'ctm', 'hdp',
]

const containsOffensiveWords = (text) => {
  const lower = text.toLowerCase()
  return OFFENSIVE_WORDS.some((word) => lower.includes(word))
}

// ──────────────────────────────────────────────────────────────────────────────
// Field-level validators — devuelven string con el error o '' si es válido
// ──────────────────────────────────────────────────────────────────────────────

const validateFullName = (value) => {
  if (!value.trim()) return 'El nombre completo es requerido.'
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(value))
    return 'Solo se permiten letras y espacios.'
  const words = value.trim().split(/\s+/)
  if (words.length < 2) return 'Ingresa al menos nombre y apellido.'
  return ''
}

const validateEmail = (value) => {
  if (!value.trim()) return 'El correo es requerido.'
  // RFC-básico: algo@algo.algo
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Ingresa un correo válido (ej: dev@gmail.com).'
  return ''
}

const validateBio = (value) => {
  if (!value.trim()) return 'La bio es requerida.'
  if (value.trim().length < 10)
    return 'La bio debe tener al menos 10 caracteres.'
  if (containsOffensiveWords(value))
    return 'La bio contiene palabras inapropiadas. Por favor, revísala.'
  return ''
}

const validateInterests = (list) => {
  if (list.length === 0) return 'Selecciona al menos un área de interés.'
  return ''
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

function RegistroPage() {
  const [fullName, setFullName] = useState('')
  const [rut, setRut] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState(['Backend'])

  // Errores por campo
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    rut: '',
    email: '',
    bio: '',
    interests: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // ── Helpers de estado ──────────────────────────────────────────────────────

  const setFieldError = (field, msg) =>
    setFieldErrors((prev) => ({ ...prev, [field]: msg }))

  const sanitizeInput = (str) => {
    if (!str) return ''
    const cleanStr = str.replace(/[<>]/g, '')
    if (['=', '+', '-', '@'].includes(cleanStr.charAt(0))) {
      return `'${cleanStr}`
    }
    return cleanStr
  }

  // ── Formateo de RUT ────────────────────────────────────────────────────────

  const formatRut = (value) => {
    const cleanValue = value.replace(/[^0-9kK]/gi, '')
    if (cleanValue.length === 0) return ''
    if (cleanValue.length === 1) return cleanValue

    const body = cleanValue.slice(0, -1)
    const dv = cleanValue.slice(-1).toUpperCase()
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${formattedBody}-${dv}`
  }

  const handleRutChange = (e) => {
    const formatted = formatRut(e.target.value)
    setRut(formatted)

    // Validación en tiempo real del RUT
    if (!formatted) {
      setFieldError('rut', 'El RUT es requerido.')
    } else if (!formatted.includes('-')) {
      setFieldError('rut', 'El RUT debe incluir el guión (ej: 12345678-9).')
    } else if (!validateRut(formatted)) {
      setFieldError('rut', 'El RUT ingresado no es válido.')
    } else {
      setFieldError('rut', '')
    }
  }

  // ── Intereses ──────────────────────────────────────────────────────────────

  const handleInterestChange = (interest) => {
    const updated = interests.includes(interest)
      ? interests.filter((i) => i !== interest)
      : [...interests, interest]

    setInterests(updated)
    setFieldError('interests', validateInterests(updated))
  }

  // ── Validación on-blur por campo ──────────────────────────────────────────

  const handleBlur = (field, value) => {
    switch (field) {
      case 'fullName':
        setFieldError('fullName', validateFullName(value))
        break
      case 'email':
        setFieldError('email', validateEmail(value))
        break
      case 'bio':
        setFieldError('bio', validateBio(value))
        break
      default:
        break
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Validar todos los campos
    const errors = {
      fullName: validateFullName(fullName),
      rut: !rut
        ? 'El RUT es requerido.'
        : !rut.includes('-')
        ? 'El RUT debe incluir el guión (ej: 12345678-9).'
        : !validateRut(rut)
        ? 'El RUT ingresado no es válido.'
        : '',
      email: validateEmail(email),
      bio: validateBio(bio),
      interests: validateInterests(interests),
    }

    setFieldErrors(errors)

    const hasErrors = Object.values(errors).some((msg) => msg !== '')
    if (hasErrors) {
      setLoading(false)
      return
    }

    try {
      const lastSubmit = localStorage.getItem('codeclub_last_submit')
      if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
        setError('Demasiadas solicitudes. Por favor, espera un minuto antes de enviar otra.')
        setLoading(false)
        return
      }

      const normalizedRut = rut.replace(/\./g, '').toLowerCase().trim()
      const normalizedEmail = email.toLowerCase().trim()

      const { error: insertError } = await supabase.from('miembros').insert([{
        nombre_completo: sanitizeInput(fullName),
        rut: normalizedRut,
        email: normalizedEmail,
        bio: sanitizeInput(bio),
        intereses: interests,
      }])

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Solicitud rechazada: Ya existe una solicitud pendiente o aprobada con este mismo RUT o Correo Institucional.')
        } else {
          setError('Error del sistema: ' + insertError.message)
        }
      } else {
        localStorage.setItem('codeclub_last_submit', Date.now().toString())
        setSuccess(true)
        setFullName('')
        setRut('')
        setEmail('')
        setBio('')
        setInterests(['Backend'])
        setFieldErrors({ fullName: '', rut: '', email: '', bio: '', interests: '' })
      }
    } catch {
      setError('Error interno de la matriz.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

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

        <form onSubmit={handleSubmit} noValidate className="animate-fade-in-up animate-delay-200 max-w-2xl space-y-12 opacity-0" style={{ animationFillMode: 'forwards' }}>

          {/* Error global */}
          {error && (
            <div className="rounded border border-error/50 bg-error-container/20 p-4 text-sm text-error">
              {error}
            </div>
          )}

          {/* Éxito */}
          {success && (
            <div className="rounded border border-[#00FF9D]/50 bg-[#00FF9D]/10 p-4 text-sm text-[#00FF9D]">
              ¡Solicitud de ingreso enviada! El administrador revisará tus datos. Recibirás un correo cuando seas aceptado.
            </div>
          )}

          {/* ── full_name ── */}
          <div className="group space-y-3">
            <label className="block font-body text-[10px] uppercase tracking-[0.3em] text-[#00FF9D]/60 transition-colors group-focus-within:text-[#00FF9D]">
              system.input(full_name)
            </label>
            <input
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (fieldErrors.fullName) setFieldError('fullName', validateFullName(e.target.value))
              }}
              onBlur={(e) => handleBlur('fullName', e.target.value)}
              className={`terminal-glow w-full rounded-none border-b bg-transparent p-4 text-lg text-on-surface placeholder:text-on-surface-variant/20 outline-none transition-all duration-500 focus:ring-0 ${fieldErrors.fullName ? 'border-error focus:border-error' : 'border-outline-variant/30 focus:border-[#00FF9D]'}`}
              placeholder="John Doe"
              type="text"
            />
            {fieldErrors.fullName && (
              <p className="font-body text-[10px] uppercase tracking-[0.2em] text-error">
                ⚠ {fieldErrors.fullName}
              </p>
            )}
          </div>

          {/* ── rut ── */}
          <div className="group space-y-3">
            <label className="block font-body text-[10px] uppercase tracking-[0.3em] text-[#00FF9D]/60 transition-colors group-focus-within:text-[#00FF9D]">
              system.input(rut)
            </label>
            <input
              required
              value={rut}
              onChange={handleRutChange}
              className={`terminal-glow w-full rounded-none border-b bg-transparent p-4 text-lg text-on-surface placeholder:text-on-surface-variant/20 outline-none transition-all duration-500 focus:ring-0 ${fieldErrors.rut ? 'border-error focus:border-error' : 'border-outline-variant/30 focus:border-[#00FF9D]'}`}
              placeholder="12345678-9"
              type="text"
            />
            {fieldErrors.rut && (
              <p className="font-body text-[10px] uppercase tracking-[0.2em] text-error">
                ⚠ {fieldErrors.rut}
              </p>
            )}
          </div>

          {/* ── email ── */}
          <div className="group space-y-3">
            <label className="block font-body text-[10px] uppercase tracking-[0.3em] text-[#00FF9D]/60 transition-colors group-focus-within:text-[#00FF9D]">
              system.input(email)
            </label>
            <input
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email) setFieldError('email', validateEmail(e.target.value))
              }}
              onBlur={(e) => handleBlur('email', e.target.value)}
              className={`terminal-glow w-full rounded-none border-b bg-transparent p-4 text-lg text-on-surface placeholder:text-on-surface-variant/20 outline-none transition-all duration-500 focus:ring-0 ${fieldErrors.email ? 'border-error focus:border-error' : 'border-outline-variant/30 focus:border-[#00FF9D]'}`}
              placeholder="dev@gmail.com"
              type="email"
            />
            {fieldErrors.email && (
              <p className="font-body text-[10px] uppercase tracking-[0.2em] text-error">
                ⚠ {fieldErrors.email}
              </p>
            )}
          </div>

          {/* ── bio ── */}
          <div className="group space-y-3">
            <label className="block font-body text-[10px] uppercase tracking-[0.3em] text-[#00FF9D]/60 transition-colors group-focus-within:text-[#00FF9D]">
              system.input(bio)
            </label>
            <textarea
              required
              value={bio}
              onChange={(e) => {
                setBio(e.target.value)
                if (fieldErrors.bio) setFieldError('bio', validateBio(e.target.value))
              }}
              onBlur={(e) => handleBlur('bio', e.target.value)}
              className={`terminal-glow min-h-[160px] w-full resize-none rounded-none border bg-transparent p-6 text-lg text-on-surface placeholder:text-on-surface-variant/20 outline-none transition-all duration-500 focus:ring-0 ${fieldErrors.bio ? 'border-error focus:border-error' : 'border-outline-variant/20 focus:border-[#00FF9D]'}`}
              placeholder="Cuéntanos un poco sobre ti y tus metas..."
              rows={4}
            />
            <div className="flex items-center justify-between">
              {fieldErrors.bio ? (
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-error">
                  ⚠ {fieldErrors.bio}
                </p>
              ) : (
                <span />
              )}
              <span className={`font-body text-[10px] tracking-widest ${bio.trim().length < 10 ? 'text-on-surface-variant/30' : 'text-[#00FF9D]/50'}`}>
                {bio.trim().length}/∞ (mín. 10)
              </span>
            </div>
          </div>

          {/* ── interests ── */}
          <div className="space-y-6">
            <label className="block font-body text-[10px] uppercase tracking-[0.3em] text-[#00FF9D]/60">
              system.select(interests)
            </label>
            <div className="flex flex-wrap gap-3">
              {['Frontend', 'Backend', 'Videojuegos', 'Ciberseguridad', 'IA'].map((interest) => (
                <label key={interest} className="group cursor-pointer">
                  <input
                    className="peer hidden"
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                  />
                  <span className="block border border-outline-variant/20 px-6 py-3 font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant transition-all hover:border-[#00FF9D]/50 peer-checked:border-primary-container peer-checked:bg-primary-container/10 peer-checked:text-primary-container">
                    {interest}
                  </span>
                </label>
              ))}
            </div>
            {fieldErrors.interests && (
              <p className="font-body text-[10px] uppercase tracking-[0.2em] text-error">
                ⚠ {fieldErrors.interests}
              </p>
            )}
          </div>

          {/* ── submit ── */}
          <div className="pt-12">
            <button
              disabled={loading}
              className="group relative w-full max-w-sm overflow-hidden bg-gradient-to-r from-[#56ffa8] to-[#00e475] py-6 text-xs font-bold uppercase tracking-[0.3em] text-[#002110] shadow-[0_20px_40px_-10px_rgba(0,255,157,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,255,157,0.4)] active:scale-[0.98] disabled:opacity-50"
              type="submit"
            >
              <span className="relative z-10">{loading ? 'Procesando...' : 'Enviar Solicitud'}</span>
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
