import os
import psycopg2
from dotenv import load_dotenv

def get_connection():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        # Build from components
        user = os.getenv("SUPABASE_USER")
        password = os.getenv("SUPABASE_PASSWORD")
        host = os.getenv("SUPABASE_URL")
        port = os.getenv("SUPABASE_PORT")
        dbname = os.getenv("SUPABASE_DATABASE")
        if all([user, password, host, port, dbname]):
            db_url = f"postgresql://{user}:{password}@{host}:{port}/{dbname}?sslmode=require"
    return db_url

def setup_database():
    try:
        db_url = get_connection()
        if not db_url:
            print("Error: No se encontró la configuración de conexión de base de datos en el archivo .env")
            return
            
        print("Conectando a la base de datos de Supabase...")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Creando tablas: admin_roles, activities, projects...")
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS public.admin_roles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            role VARCHAR(50) NOT NULL DEFAULT 'admin',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS public.activities (
            id SERIAL PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            descripcion TEXT,
            fecha_evento TIMESTAMP WITH TIME ZONE,
            estado VARCHAR(50) DEFAULT 'pendiente'
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS public.projects (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            storage_path VARCHAR(255)
        );
        """)
        
        print("Habilitando Row Level Security (RLS)...")
        cursor.execute("ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;")
        cursor.execute("ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;")
        cursor.execute("ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;")
        
        print("Configurando políticas de seguridad (Policies)...")
        
        policy_script = """
        DO $$ 
        BEGIN
            -- Eliminar políticas existentes para evitar errores
            DROP POLICY IF EXISTS activities_select_policy ON public.activities;
            DROP POLICY IF EXISTS activities_insert_policy ON public.activities;
            DROP POLICY IF EXISTS activities_update_policy ON public.activities;
            DROP POLICY IF EXISTS activities_delete_policy ON public.activities;
            
            DROP POLICY IF EXISTS projects_select_policy ON public.projects;
            DROP POLICY IF EXISTS projects_insert_policy ON public.projects;
            DROP POLICY IF EXISTS projects_update_policy ON public.projects;
            DROP POLICY IF EXISTS projects_delete_policy ON public.projects;

            DROP POLICY IF EXISTS admin_roles_select_policy ON public.admin_roles;
            DROP POLICY IF EXISTS admin_roles_insert_policy ON public.admin_roles;
            DROP POLICY IF EXISTS admin_roles_update_policy ON public.admin_roles;
            DROP POLICY IF EXISTS admin_roles_delete_policy ON public.admin_roles;
        END $$;
        
        -- Políticas para activities (Lectura pública, mutación solo administradores)
        CREATE POLICY activities_select_policy ON public.activities FOR SELECT USING (true);
        CREATE POLICY activities_insert_policy ON public.activities FOR INSERT WITH CHECK (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        CREATE POLICY activities_update_policy ON public.activities FOR UPDATE USING (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        CREATE POLICY activities_delete_policy ON public.activities FOR DELETE USING (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        
        -- Políticas para projects (Lectura pública, mutación solo administradores)
        CREATE POLICY projects_select_policy ON public.projects FOR SELECT USING (true);
        CREATE POLICY projects_insert_policy ON public.projects FOR INSERT WITH CHECK (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        CREATE POLICY projects_update_policy ON public.projects FOR UPDATE USING (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        CREATE POLICY projects_delete_policy ON public.projects FOR DELETE USING (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        
        -- Políticas para admin_roles (Lectura pública, mutación solo administradores)
        CREATE POLICY admin_roles_select_policy ON public.admin_roles FOR SELECT USING (true);
        CREATE POLICY admin_roles_insert_policy ON public.admin_roles FOR INSERT WITH CHECK (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        CREATE POLICY admin_roles_update_policy ON public.admin_roles FOR UPDATE USING (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        CREATE POLICY admin_roles_delete_policy ON public.admin_roles FOR DELETE USING (
            auth.uid() IN (SELECT id FROM public.admin_roles)
        );
        """
        cursor.execute(policy_script)
        
        print("¡Configuración de base de datos Supabase completada con éxito!")
        print("Estructura de la base de datos y políticas RLS implementadas correctamente.")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"Error de base de datos SQL: {e}")
    except Exception as e:
        print(f"Error general: {e}")

if __name__ == "__main__":
    setup_database()
