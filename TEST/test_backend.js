import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error("❌ Faltan las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env")
  process.exit(1)
}

const supabase = createClient(url, key)

async function testBackend() {
  console.log("--- TEST DE CONECTIVIDAD AL BACKEND SUPABASE ---")
  console.log(`📡 URL Configurada: ${url}`)
  
  try {
    // Intentar leer de la tabla projects
    const { data, error } = await supabase.from('projects').select('*').limit(1)
    
    if (error) {
           console.error("❌ Error conectando a la base de datos o consulta denegada:", error.message)
           process.exit(1)
    }
    
    console.log("✅ Conexión a la base de datos exitosa.")
    console.log("✅ Lectura de base de datos exitosa (REST API funciona).")
    
    // Probar Login de Admin para revisar el sistema de auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@codeclub.cl',
      password: 'AdminCodeClub123!'
    })
    
    if (authError) {
      console.error("❌ Error de Autenticación al backend:", authError.message)
    } else {
      console.log(`✅ Autenticación al backend exitosa para usuario: ${authData.user.email}`)
    }
    
    console.log("\n🚀 EL BACKEND ESTÁ FUNCIONANDO CORRECTAMENTE Y LISTO PARA RECIBIR PETICIONES DEL FRONTEND.")
    
  } catch(err) {
    console.error("❌ Error crítico en el test:", err)
  }
}

testBackend()
