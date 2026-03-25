export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { email, name, status } = req.body

  if (!email || !name) {
    return res.status(400).json({ error: 'Faltan datos (email, name)' })
  }

  // To use this in production on Vercel, the user must add RESEND_API_KEY environment variable.
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
        from: 'Code Club <onboarding@resend.dev>', // Replace with custom domain if available
        to: [email],
        subject: '¡Solicitud Aprobada! Bienvenido a Code Club',
        html: `
          <div style="font-family: monospace; color: #111; padding: 20px; text-align: left;">
            <h2 style="color: #00FF9D; background: #111; padding: 10px; display: inline-block;">>_ ACCESO CONCEDIDO</h2>
            <p>Hola <strong>${name}</strong>,</p>
            <p>Tu solicitud de ingreso ha sido evaluada y <strong>aprobada</strong> por el administrador del sistema.</p>
            <p>Bienvenido oficialmente al Code Club. Mantente atento a nuestras próximas comunicaciones donde te compartiremos las directrices de acceso al servidor de Discord y herramientas de trabajo.</p>
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
