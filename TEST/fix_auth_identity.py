import psycopg2
import os
import uuid
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
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        user_uuid = "11111111-2222-3333-4444-555555555555"
        identity_id = str(uuid.uuid4())
        
        sql = """
        INSERT INTO auth.identities (
            id,
            provider_id,
            user_id,
            identity_data,
            provider,
            created_at,
            updated_at
        ) VALUES (
            %s,
            %s,
            %s,
            '{"sub": "11111111-2222-3333-4444-555555555555", "email": "admin@codeclub.cl"}',
            'email',
            now(),
            now()
        ) ON CONFLICT DO NOTHING;
        """
        cursor.execute(sql, (identity_id, user_uuid, user_uuid))
        print("Identidad creada en auth.identities!")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error fijando identidad: {e}")

if __name__ == "__main__":
    main()
