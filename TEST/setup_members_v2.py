import os
import psycopg2
from dotenv import load_dotenv

def setup_members_v2():
    load_dotenv()
    
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
        
        print("Adding rut column and unique constraints to miembros...")
        
        migration_script = """
        -- 1. Add rut column if it doesn't exist
        ALTER TABLE public.miembros ADD COLUMN IF NOT EXISTS rut VARCHAR(20);
        
        -- 2. Add unique constraint to rut if it doesn't exist
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'unique_rut'
            ) THEN
                ALTER TABLE public.miembros ADD CONSTRAINT unique_rut UNIQUE (rut);
            END IF;
        END $$;
        
        -- 3. Add unique constraint to email if it doesn't exist
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'unique_email'
            ) THEN
                ALTER TABLE public.miembros ADD CONSTRAINT unique_email UNIQUE (email);
            END IF;
        END $$;
        """
        cursor.execute(migration_script)
        print("✅ members table v2 updated successfully! Added rut and unique filters.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error updating members table: {e}")

if __name__ == "__main__":
    setup_members_v2()
