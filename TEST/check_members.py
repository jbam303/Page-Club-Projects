import os
import psycopg2
from dotenv import load_dotenv

def check_members():
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
        cursor.execute("SELECT email, estado FROM public.miembros;")
        rows = cursor.fetchall()
        print("Members in DB:")
        for r in rows:
            print(f"- {r[0]} (Estado: {r[1]})")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error checking DB: {e}")

if __name__ == "__main__":
    check_members()
