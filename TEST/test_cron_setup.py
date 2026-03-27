import os
import psycopg2
from dotenv import load_dotenv
from datetime import datetime, timedelta

def setup_mock_activity():
    load_dotenv(dotenv_path='../.env')
    
    host = os.getenv("SUPABASE_URL", "").strip()
    port = os.getenv("SUPABASE_PORT", "6543").strip()
    user = os.getenv("SUPABASE_USER", "").strip()
    password = os.getenv("SUPABASE_PASSWORD", "").strip()
    dbname = os.getenv("SUPABASE_DATABASE", "postgres").strip()
    
    db_url = f"postgresql://{user}:{password}@{host}:{port}/{dbname}?sslmode=require"
    
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # 30 minutes from now
        future_date = datetime.utcnow() + timedelta(minutes=30)
        
        cursor.execute("""
            INSERT INTO public.activities (titulo, descripcion, lugar, estado, fecha_evento, reminder_sent)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, ("⚠️ Test CRON Automation", "Prueba generada automáticamente", "Discord Virtual", "Pendiente", future_date, False))
        
        new_id = cursor.fetchone()[0]
        print(f"✅ Created mock activity ID: {new_id} scheduled for {future_date.isoformat()}")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error updating database: {e}")

if __name__ == "__main__":
    setup_mock_activity()
