import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Verify Admin JWT via Authorization Header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  // We MUST use the Service Role Key to bypass RLS for reading members
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) {
    return res.status(500).json({ error: 'Server misconfiguration: missing SUPABASE_SERVICE_ROLE_KEY environment variable.' });
  }
  
  // Create client using Service Role to act as admin service
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // But we still need to verify the caller token using Anon Key or auth.getUser
  const supabaseAnon = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
  }

  // Verify Admin Role
  const { data: adminRole, error: roleError } = await supabaseAnon
    .from('admin_roles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (roleError || !adminRole) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  // 2. Fetch the specific activity
  const { activityId } = req.body;
  if (!activityId) {
    return res.status(400).json({ error: 'Faltan datos (activityId)' });
  }

  const { data: act, error: actError } = await supabase
    .from('activities')
    .select('*')
    .eq('id', activityId)
    .single();

  if (actError || !act) {
    return res.status(404).json({ error: 'Actividad no encontrada' });
  }
  if (act.reminder_sent) {
    return res.status(400).json({ error: 'El recordatorio ya fue enviado previamente.' });
  }
  if (act.estado === 'Completado') {
    return res.status(400).json({ error: 'La actividad ya está completada.' });
  }

  // 3. Fetch approved members
  const { data: members, error: memError } = await supabase
    .from('miembros')
    .select('email')
    .eq('estado', 'aprobado');

  if (memError || !members || members.length === 0) {
    return res.status(400).json({ error: 'No hay miembros aprobados a los que notificar.' });
  }

  const recipientEmails = members.map(m => m.email);
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    // Simulate sending
    await supabase.from('activities').update({ reminder_sent: true }).eq('id', activityId);
    return res.status(200).json({ message: 'Envío simulado. Faltan claves de Resend.' });
  }

  // 4. Send Emails via Resend
  try {
    const eventDateStr = act.fecha_evento 
      ? new Date(act.fecha_evento).toLocaleString('es-ES', { 
          timeZone: 'America/Santiago', dateStyle: 'full', timeStyle: 'short' 
        })
      : 'Pronto';

    const chunkSize = 50;
    for (let i = 0; i < recipientEmails.length; i += chunkSize) {
      const chunk = recipientEmails.slice(i, i + chunkSize);
      
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'Club de Desarrollo de Proyectos Tecnológicos <admin@club-dpt.site>',
          to: ['admin@club-dpt.site'], // single main recipient
          bcc: chunk, // the members blind copied
          subject: `📢 Aviso: ${act.titulo}`,
          html: `
            <div style="font-family: monospace; color: #111; padding: 20px; text-align: left;">
              <h2 style="color: #00FF9D; background: #111; padding: 10px; display: inline-block;">>_ ALERTA DE ACTIVIDAD</h2>
              <p>Estimado Miembro,</p>
              <p>Te enviamos este aviso para recordarte sobre la actividad <strong>${act.titulo}</strong>.</p>
              <ul>
                <li><strong>Inicio:</strong> ${eventDateStr}</li>
                <li><strong>Lugar / Enlace:</strong> ${act.lugar || 'No especificado'}</li>
                <li><strong>Detalles:</strong> ${act.descripcion}</li>
              </ul>
              <p>¡Te esperamos!</p>
              <br/>
              <p>Atentamente,<br/>El equipo de administración</p>
            </div>
          `
        })
      });

      if (!resendRes.ok) {
        const errorText = await resendRes.text();
        console.error('Resend Error:', errorText);
        throw new Error('Resend API Error');
      }
    }

    // 5. Update activity status
    await supabase.from('activities').update({ reminder_sent: true }).eq('id', activityId);

    return res.status(200).json({ message: `Notificación enviada a ${recipientEmails.length} miembros.` });
  } catch (error) {
    console.error('Email dispatch error:', error);
    return res.status(500).json({ error: 'Error interno enviando correos.' });
  }
}
