import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // 1. Extraer el token de autorización enviado desde MemberList.jsx
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.replace('Bearer ', '');

  // 2. Autenticar usando Supabase 
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  // Usar ANON_KEY para verificar token (o SERVICE_ROLE, pero ANON + getUser es más seguro para validar tokens de cliente)
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
  }

  // 3. Verificar si el UID pertenece a un administrador
  const { data: adminRole, error: roleError } = await supabase
    .from('admin_roles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (roleError || !adminRole) {
    return res.status(403).json({ error: 'Forbidden: Admin access required to dispatch emails' });
  }

  // --- FIN DE VALIDACIÓN DE SEGURIDAD --- //

  const { email, name, status } = req.body

  if (!email || !name) {
    return res.status(400).json({ error: 'Faltan datos (email, name)' })
  }

  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.log(`[Mock Email] To: ${email} | Subject: Acceso Concedido | Name: ${name}`)
    // Simulating email dispatch for local development
    return res.status(200).json({ message: 'Envío simulado. Configura RESEND_API_KEY en Vercel para correos reales.' })
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Club de Desarrollo de Proyectos Tecnológicos <onboarding@resend.dev>',
        to: [email],
        subject: '¡Solicitud Aprobada! Bienvenido al Club de Desarrollo de Proyectos Tecnológicos',
        html: `
          <div style="font-family: monospace; color: #111; padding: 20px; text-align: left;">
            <h2 style="color: #00FF9D; background: #111; padding: 10px; display: inline-block;">>_ ACCESO CONCEDIDO</h2>
            <p>Hola <strong>${name}</strong>,</p>
            <p>Tu solicitud de ingreso ha sido evaluada y <strong>aprobada</strong> por el administrador del sistema.</p>
            <p>Bienvenido oficialmente al Club de Desarrollo de Proyectos Tecnológicos. Mantente atento a nuestras próximas comunicaciones donde te compartiremos las directrices de acceso al servidor de Discord y herramientas de trabajo.</p>
            <br/>
            <p>Únete a nuestro grupo oficial de WhatsApp para presentarte, conocer a los demás integrantes y estar al tanto de los próximos anuncios:</p>
            <p><a href="https://chat.whatsapp.com/BVe0EXdZXZa1Il3VSOylfw" style="color: #00FF9D; text-decoration: none; border-bottom: 1px dashed #00FF9D;">Entrar al grupo de WhatsApp</a></p>
            <br/>
            <p><em>System.Exit(0)</em></p>
          </div>
        `
      })
    })

    const data = await response.json()

    if (response.ok) {
      return res.status(200).json(data)
    } else {
      return res.status(400).json({ error: data.message })
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
