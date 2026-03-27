import os
import psycopg2
from dotenv import load_dotenv

def setup_storage_rls():
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
        
        # Allow authenticated users (admins) to INSERT files into the 'projects' bucket
        print("Setting up RLS policies for storage.objects (bucket: projects)...")
        
        cursor.execute("""
            DO $$
            BEGIN
              -- Allow authenticated users to upload
              IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow auth upload to projects'
              ) THEN
                CREATE POLICY "Allow auth upload to projects" ON storage.objects
                  FOR INSERT TO authenticated
                  WITH CHECK (bucket_id = 'projects');
              END IF;

              -- Allow public read access
              IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public read projects'
              ) THEN
                CREATE POLICY "Allow public read projects" ON storage.objects
                  FOR SELECT TO public
                  USING (bucket_id = 'projects');
              END IF;

              -- Allow authenticated users to update their files
              IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow auth update projects'
              ) THEN
                CREATE POLICY "Allow auth update projects" ON storage.objects
                  FOR UPDATE TO authenticated
                  USING (bucket_id = 'projects');
              END IF;

              -- Allow authenticated users to delete files
              IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow auth delete projects'
              ) THEN
                CREATE POLICY "Allow auth delete projects" ON storage.objects
                  FOR DELETE TO authenticated
                  USING (bucket_id = 'projects');
              END IF;
            END
            $$;
        """)
        
        # Also add INSERT policy for the proyectos DB table (for authenticated admins)
        cursor.execute("""
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'proyectos' AND policyname = 'Admin puede insertar proyectos'
              ) THEN
                CREATE POLICY "Admin puede insertar proyectos" ON public.proyectos FOR INSERT TO authenticated WITH CHECK (true);
              END IF;
              IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'proyectos' AND policyname = 'Admin puede editar proyectos'
              ) THEN
                CREATE POLICY "Admin puede editar proyectos" ON public.proyectos FOR UPDATE TO authenticated USING (true);
              END IF;
              IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'proyectos' AND policyname = 'Admin puede eliminar proyectos'
              ) THEN
                CREATE POLICY "Admin puede eliminar proyectos" ON public.proyectos FOR DELETE TO authenticated USING (true);
              END IF;
            END
            $$;
        """)
        
        conn.commit()
        print("✅ All RLS policies created successfully!")
        
        cursor.execute("NOTIFY pgrst, 'reload schema';")
        conn.commit()
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_storage_rls()
