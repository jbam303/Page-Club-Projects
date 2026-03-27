import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReactData() {
  console.log("Fetching activities like React does...");
  const { data: activities, error: actError } = await supabase
    .from('activities')
    .select('*')
    .order('id', { ascending: true });

  console.log("REACT GETS ACTIVITIES:", JSON.stringify(activities, null, 2));

  console.log("Fetching schedules like React does...");
  const { data: schedules, error: schError } = await supabase
    .from('horarios_club')
    .select('*');

  console.log("REACT GETS SCHEDULES:", JSON.stringify(schedules, null, 2));
}

checkReactData();
