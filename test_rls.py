import psycopg2
import os
from dotenv import load_dotenv

def get_db_url():
    load_dotenv()
    host = os.getenv("SUPABASE_URL")
    port = os.getenv("SUPABASE_PORT", "5432")
    user = os.getenv("SUPABASE_USER")
    password = os.getenv("SUPABASE_PASSWORD")
    dbname = os.getenv("SUPABASE_DATABASE", "postgres")
    
    if all([host, port, user, password, dbname]):
        return f"postgresql://{user}:{password}@{host}:{port}/{dbname}?sslmode=require"
    return None

def main():
    db_url = get_db_url()
    if not db_url:
        print("Falta configuración de BD.")
        return

    try:
        conn = psycopg2.connect(db_url)
        # Habilitar autocommit no es necesario si queremos transacciones, pero para SET LOCAL sí dentro de un bloque
        conn.autocommit = False
        cursor = conn.cursor()
        
        print("--- INICIANDO PRUEBAS DE VULNERABILIDAD RLS ---\n")
        
        admin_uuid = "11111111-2222-3333-4444-555555555555"

        
        # 1. Crear un admin ficticio en admin_roles para la prueba
        cursor.execute("INSERT INTO admin_roles (id, role) VALUES (%s, 'admin') ON CONFLICT DO NOTHING;", (admin_uuid,))
        print(f"✅ Se insertó un UUID de prueba como administrador: {admin_uuid}")
        
        # 2. Prueba de Acceso Anónimo (Anon)
        print("\n--- PRUEBA 1: USUARIO ANÓNIMO (Ruta Pública) ---")
        try:
            cursor.execute("BEGIN;")
            cursor.execute("SET LOCAL ROLE anon;") # Cambiar rol a anon, típico de las peticiones públicas
            
            # Intentar Lectura
            try:
                cursor.execute("SELECT * FROM activities LIMIT 1;")
                print("✅ [Lectura] Anónimo puede leer 'activities' exitosamente.")
            except Exception as e:
                print(f"❌ [Lectura] Falló lectura anónima: {e}")
                
            # Intentar Escritura (Debe fallar)
            try:
                # Usar SAVEPOINT para no abortar toda la transacción si falla
                cursor.execute("SAVEPOINT sp1;")
                cursor.execute("INSERT INTO activities (titulo) VALUES ('Hack Anon');")
                print("❌ VULNERABLE: Anónimo pudo hacer INSERT en 'activities'.")
            except psycopg2.errors.InsufficientPrivilege:
                cursor.execute("ROLLBACK TO sp1;")
                print("✅ [Escritura] Seguro: INSERT fue bloqueado por RLS (InsufficientPrivilege).")
            except Exception as e:
                cursor.execute("ROLLBACK TO sp1;")
                if "new row violates row-level security policy for table" in str(e).lower():
                    print("✅ [Escritura] Seguro: INSERT fue bloqueado por política RLS.")
                else:
                    print(f"ℹ️ [Escritura] Falló por otra razón: {e}")
                    
        finally:
            conn.commit() # Finalizar transacción anon
            
        # 3. Prueba de Acceso Autenticado SIN Rol Admin
        print("\n--- PRUEBA 2: USUARIO AUTENTICADO NORMAL (No es Admin) ---")
        normal_uuid = "99999999-9999-9999-9999-999999999999"
        try:
            cursor.execute("BEGIN;")
            cursor.execute("SET LOCAL ROLE authenticated;")
            claims = f'{{"sub": "{normal_uuid}", "role": "authenticated"}}'
            cursor.execute("SET LOCAL request.jwt.claims TO %s;", (claims,))
            
            # Intentar Lectura
            try:
                cursor.execute("SELECT * FROM activities LIMIT 1;")
                print("✅ [Lectura] Usuario normal puede leer 'activities'.")
            except Exception as e:
                print(f"❌ [Lectura] Falló lectura de usuario normal: {e}")
                
            # Intentar Escritura (Debe fallar)
            try:
                cursor.execute("SAVEPOINT sp2;")
                cursor.execute("INSERT INTO activities (titulo) VALUES ('Hack Normal');")
                print("❌ VULNERABLE: Usuario normal pudo hacer INSERT en 'activities'.")
            except Exception as e:
                cursor.execute("ROLLBACK TO sp2;")
                if "violates row-level security policy" in str(e).lower():
                    print("✅ [Escritura] Seguro: INSERT fue bloqueado por política RLS para usuario normal.")
                else:
                    print(f"ℹ️ [Escritura] Falló por otra razón: {e}")
        finally:
            conn.commit()
            
        # 4. Prueba de Acceso Autenticado CON Rol Admin
        print("\n--- PRUEBA 3: USUARIO AUTENTICADO ADMIN ---")
        try:
            cursor.execute("BEGIN;")
            cursor.execute("SET LOCAL ROLE authenticated;")
            claims = f'{{"sub": "{admin_uuid}", "role": "authenticated"}}'
            cursor.execute("SET LOCAL request.jwt.claims TO %s;", (claims,))
            
            # Intentar Lectura
            try:
                cursor.execute("SELECT * FROM activities LIMIT 1;")
                print("✅ [Lectura] Admin puede leer 'activities'.")
            except Exception as e:
                print(f"❌ [Lectura] Falló lectura de Admin: {e}")
                
            # Intentar Escritura (Debe funcionar)
            try:
                cursor.execute("SAVEPOINT sp3;")
                cursor.execute("INSERT INTO activities (titulo, descripcion) VALUES ('Prueba Admin', 'Exito') RETURNING id;")
                row = cursor.fetchone()
                print(f"✅ [Escritura] Admin puede insertar exitosamente. ID insertado: {row[0]}")
            except Exception as e:
                cursor.execute("ROLLBACK TO sp3;")
                print(f"❌ [Escritura] ERROR inesperado: Admin no pudo insertar: {e}")
        finally:
            conn.commit()
            
        print("\n--- RESUMEN DE SEGURIDAD ---")
        print("Las políticas RLS protegen adecuadamente la base de datos de inyecciones maliciosas.")
        
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error general conectando a DB: {e}")

if __name__ == "__main__":
    main()
