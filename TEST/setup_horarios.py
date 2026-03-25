import os
import psycopg2
from dotenv import load_dotenv

def setup_horarios():
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
        
        print("Adding lugar column to activities...")
        cursor.execute("ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS lugar VARCHAR(255);")
        
        print("Creating horarios_club table...")
        migration_script = """
        CREATE TABLE IF NOT EXISTS public.horarios_club (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            dia VARCHAR(50) NOT NULL,
            horas VARCHAR(100) NOT NULL,
            lugar VARCHAR(255) NOT NULL
        );
        
        -- Enable Row Level Security
        ALTER TABLE public.horarios_club ENABLE ROW LEVEL SECURITY;
        
        -- 1. Public can view all schedules
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE policyname = 'horarios_select_policy' AND tablename = 'horarios_club'
            ) THEN
                CREATE POLICY horarios_select_policy ON public.horarios_club
                FOR SELECT USING (true);
            END IF;
        END $$;
        
        -- 2. Only authenticated admins can insert
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE policyname = 'horarios_insert_policy' AND tablename = 'horarios_club'
            ) THEN
                CREATE POLICY horarios_insert_policy ON public.horarios_club
                FOR INSERT WITH CHECK (
                    auth.uid() IN (SELECT id FROM public.admin_roles)
                );
            END IF;
        END $$;
        
        -- 3. Only admins can update
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE policyname = 'horarios_update_policy' AND tablename = 'horarios_club'
            ) THEN
                CREATE POLICY horarios_update_policy ON public.horarios_club
                FOR UPDATE USING (
                    auth.uid() IN (SELECT id FROM public.admin_roles)
                );
            END IF;
        END $$;
        
        -- 4. Only admins can delete
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE policyname = 'horarios_delete_policy' AND tablename = 'horarios_club'
            ) THEN
                CREATE POLICY horarios_delete_policy ON public.horarios_club
                FOR DELETE USING (
                    auth.uid() IN (SELECT id FROM public.admin_roles)
                );
            END IF;
        END $$;
        """
        cursor.execute(migration_script)
        print("✅ Database updated successfully! Added lugar to activities and generated horarios_club with strict RLS.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error updating database: {e}")

if __name__ == "__main__":
    setup_horarios()
