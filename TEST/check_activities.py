import os
import psycopg2
from dotenv import load_dotenv

def check_activities():
    load_dotenv(dotenv_path='../.env')
    host = os.getenv("SUPABASE_URL", "").strip()
    port = os.getenv("SUPABASE_PORT", "6543").strip()
    user = os.getenv("SUPABASE_USER", "").strip()
    password = os.getenv("SUPABASE_PASSWORD", "").strip()
    dbname = os.getenv("SUPABASE_DATABASE", "postgres").strip()
    
    db_url = f"postgresql://{user}:{password}@{host}:{port}/{dbname}?sslmode=require"
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        cursor.execute("SELECT id, titulo, fecha_evento, estado FROM public.activities;")
        rows = cursor.fetchall()
        print("Activities in DB:")
        for r in rows:
            print(f"- {r[1]} (Fecha: {r[2]}, Estado: {r[3]})")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error checking DB: {e}")

if __name__ == "__main__":
    check_activities()
