import os
import psycopg2
from dotenv import load_dotenv

def setup_reminders():
    load_dotenv(dotenv_path='../.env')
    
    host = os.getenv("SUPABASE_URL", "").strip()
    port = os.getenv("SUPABASE_PORT", "6543").strip()
    user = os.getenv("SUPABASE_USER", "").strip()
    password = os.getenv("SUPABASE_PASSWORD", "").strip()
    dbname = os.getenv("SUPABASE_DATABASE", "postgres").strip()
    
    if not all([host, port, user, password, dbname]):
        print("Missing .env database connection variables")
        return
        
    db_url = f"postgresql://{user}:{password}@{host}:{port}/{dbname}?sslmode=require"
    print(f"Connecting to {host}:{port}...")
    
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Adding reminder_sent column to activities...")
        cursor.execute("ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;")
        
        print("✅ Database updated successfully! Added reminder_sent to activities for tracking automatic emails.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error updating database: {e}")

if __name__ == "__main__":
    setup_reminders()
