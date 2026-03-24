import os
import psycopg2
from dotenv import load_dotenv

def setup_members():
    load_dotenv()
    
    host = os.getenv("SUPABASE_URL", "").strip()
    port = os.getenv("SUPABASE_PORT", "6543").strip()
    user = os.getenv("SUPABASE_USER", "").strip()
    password = os.getenv("SUPABASE_PASSWORD", "").strip()
    dbname = os.getenv("SUPABASE_DATABASE", "postgres").strip()
    
    db_url = f"postgresql://{user}:{password}@{host}:6543/{dbname}?sslmode=require"
    print(f"Connecting to {host}:6543...")
    
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Creating miembros table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS public.miembros (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nombre_completo VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            bio TEXT,
            intereses TEXT[],
            estado VARCHAR(50) DEFAULT 'pendiente',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        print("Enabling RLS on miembros...")
        cursor.execute("ALTER TABLE public.miembros ENABLE ROW LEVEL SECURITY;")
        
        print("Applying strict security policies...")
        
        policy_script = """
        DO $$ 
        BEGIN
            DROP POLICY IF EXISTS miembros_insert_policy ON public.miembros;
            DROP POLICY IF EXISTS miembros_select_policy ON public.miembros;
            DROP POLICY IF EXISTS miembros_update_policy ON public.miembros;
            DROP POLICY IF EXISTS miembros_delete_policy ON public.miembros;
        END $$;
        
        -- PUBLIC INSERT: Any user (anon or authenticated) can submit a registration form
        -- But they CANNOT read other records
        CREATE POLICY miembros_insert_policy ON public.miembros FOR INSERT WITH CHECK (true);
        
        -- ADMIN SELECT/UPDATE/DELETE: Only users in admin_roles can manage members
        CREATE POLICY miembros_select_policy ON public.miembros FOR SELECT USING (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        CREATE POLICY miembros_update_policy ON public.miembros FOR UPDATE USING (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        CREATE POLICY miembros_delete_policy ON public.miembros FOR DELETE USING (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        """
        cursor.execute(policy_script)
        
        print("✅ members table and secure RLS policies created successfully!")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error creating members table: {e}")

if __name__ == "__main__":
    setup_members()
