import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 1. Validate Cron Secret for security
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid CRON Secret' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  // Use Service Role or Anon. Service Role is preferred for backend automation.
  // We'll use ANON key if Service Role isn't available, but we must make sure policies allow it.
  // Actually, since we want to read Members and update Activities, we might need a higher privilege.
  // But wait, if RLS prevents reading members, we'll configure ANON to read via policies or just use what works.
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 2. Fetch pending activities that haven't sent a reminder yet and have a date
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select('*')
      .eq('estado', 'Pendiente')
      .eq('reminder_sent', false)
      .not('fecha_evento', 'is', null);

    if (actError) {
      console.error('Error fetching activities:', actError);
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }

    if (!activities || activities.length === 0) {
      return res.status(200).json({ message: 'No upcoming activities need reminders.' });
    }

    // 3. Filter activities happening within the next 45 minutes
    const now = new Date();
    const futureLimit = new Date(now.getTime() + 45 * 60 * 1000); // Now + 45 mins

    const impendingActivities = activities.filter(act => {
      const eventDate = new Date(act.fecha_evento);
      // Event is in the future but starts before the futureLimit
      return eventDate > now && eventDate <= futureLimit;
    });

    if (impendingActivities.length === 0) {
      return res.status(200).json({ message: 'No activities strictly starting within the next 45 mins.' });
    }

    // 4. Fetch all approved members
    const { data: members, error: memError } = await supabase
      .from('miembros')
      .select('email')
      .eq('estado', 'aprobado');

    if (memError || !members || members.length === 0) {
      console.error('Error fetching members:', memError);
      return res.status(500).json({ error: 'Failed to fetch approved members or no members exist' });
    }

    const recipientEmails = members.map(m => m.email);
    const resendApiKey = process.env.RESEND_API_KEY;

    // 5. Send emails & update DB
    for (const act of impendingActivities) {
      const eventDateStr = new Date(act.fecha_evento).toLocaleString('es-ES', { 
        timeZone: 'America/Santiago', // assuming Chile based on RUT logic earlier
        dateStyle: 'full', 
        timeStyle: 'short' 
      });

      if (resendApiKey) {
        // We use BCC to send one email to everyone (max 50 in a batch usually, resend allows 50 recipients per request)
        // If there are more than 50 members, we chunk them.
        const chunkSize = 50;
        for (let i = 0; i < recipientEmails.length; i += chunkSize) {
          const chunk = recipientEmails.slice(i, i + chunkSize);
          
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'Club de Desarrollo de Proyectos Tecnológicos <admin@club-dpt.site>',
              to: ['admi@club-dpt.site'], // Sent to admin or a dummy, bcc handles the rest
              bcc: chunk,
              subject: `⏳ Recordatorio: ${act.titulo} comienza pronto`,
              html: `
                <div style="font-family: monospace; color: #111; padding: 20px; text-align: left;">
                  <h2 style="color: #00FF9D; background: #111; padding: 10px; display: inline-block;">>_ ALERTA DE ACTIVIDAD</h2>
                  <p>Estimado Miembro,</p>
                  <p>Te recordamos que la actividad <strong>${act.titulo}</strong> está programada para comenzar muy pronto.</p>
                  <ul>
                    <li><strong>Hora Base:</strong> ${eventDateStr}</li>
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
        }
      } else {
        console.log(`[Mock CRON] Sent reminder for ${act.titulo} to ${recipientEmails.length} members.`);
      }

      // Mark as notified so we don't send it again in the next 15 mins
      await supabase
        .from('activities')
        .update({ reminder_sent: true })
        .eq('id', act.id);
    }

    return res.status(200).json({ message: `Successfully sent reminders for ${impendingActivities.length} activities.` });

  } catch (err) {
    console.error('Cron job error:', err);
    return res.status(500).json({ error: 'Internal server execution error' });
  }
}
