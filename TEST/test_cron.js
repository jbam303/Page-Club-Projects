import { createClient } from '@supabase/supabase-js';
import handler from '../api/cronReminders.js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8').split('\n');
  envConfig.forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

// Override CRON_SECRET for test simplicity if not set
const secret = process.env.CRON_SECRET || 'test_secret';
process.env.CRON_SECRET = secret;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ Warning: SUPABASE_SERVICE_ROLE_KEY not found. Attempting with ANON key (may fail RLS).");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("🛠️  [Step 1] Creating a mock activity starting in 30 minutes...");
  
  const futureDate = new Date();
  futureDate.setMinutes(futureDate.getMinutes() + 30);
  
  const { data: mockAct, error: actError } = await supabase
    .from('activities')
    .insert([{
      titulo: '⚠️ Test CRON Automation',
      descripcion: 'Prueba generada automáticamente por la IA para verificar correos',
      lugar: 'Discord Virtual',
      estado: 'Pendiente',
      fecha_evento: futureDate.toISOString(),
      reminder_sent: false
    }])
    .select();

  if (actError || !mockAct || mockAct.length === 0) {
    console.error("❌ Failed to create mock activity:", actError);
    process.exit(1);
  }

  const newId = mockAct[0].id;
  console.log(`✅ Created mock activity ID: ${newId} scheduled for ${futureDate.toISOString()}`);

  console.log(`\n🚀 [Step 2] Triggering the Serverless CRON Function locally with secret: ${secret} ...`);
  
  let statusCode = 200;
  let jsonResponse = null;

  const req = {
    headers: {
      authorization: `Bearer ${secret}`
    }
  };

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResponse = data;
    }
  };

  try {
    await handler(req, res);
    console.log(`\n📡 CRON Handler returned HTTP ${statusCode}`);
    console.log(`💬 CRON Response:`, jsonResponse);

    if (statusCode === 200) {
      console.log("✅ Success! The handler fired the emails.");
    } else {
      console.error("❌ CRON failed.");
    }
    
    // Cleanup
    console.log("\n🧹 [Step 3] Cleaning up mock activity...");
    await supabase.from('activities').delete().eq('id', newId);
    console.log("✅ DB Cleaned.");
    
  } catch (err) {
    console.error("❌ CRON Execution Exception:", err);
  }
}

runTest();
