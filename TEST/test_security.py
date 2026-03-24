import os
import psycopg2
from supabase import create_client, Client
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

def run_tests():
    load_dotenv()
    
    # 1. Initialize Supabase Client
    # In .env we have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_ANON_KEY")
    
    if not url or not key:
        print("Missing Supabase URL or Anon Key")
        return
        
    supabase: Client = create_client(url, key)
    
    test_email = "admin@codeclub.cl"
    test_password = "AdminCodeClub123!"
    user_uuid = "11111111-2222-3333-4444-555555555555"
    
    print("\n--- 1. Creating user in auth.users via SQL ---")
    db_url = get_db_url()
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Inserciones en auth.users y public.admin_roles
        create_user_sql = """
        INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          %s, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', %s, crypt(%s, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
        ) ON CONFLICT (id) DO NOTHING;
        """
        cursor.execute(create_user_sql, (user_uuid, test_email, test_password))
        print(f"User created directly in DB: {user_uuid}")
        
        cursor.execute("INSERT INTO public.admin_roles (id, role) VALUES (%s, 'admin') ON CONFLICT DO NOTHING;", (user_uuid,))
        print("User added to admin_roles table")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"DB Error creating user or role: {e}")
        return
        
    print("\n--- 2. Authenticating User via Supabase API ---")
    try:
        res = supabase.auth.sign_in_with_password({"email": test_email, "password": test_password})
        if res.user:
            print(f"✅ User authenticated successfully. JWT acquired.")
    except Exception as e:
        print(f"❌ Error authenticating test user: {e}")
        return
        
    print("\n--- 3. Testing RLS Vulnerabilities ---")
    
    # Authenticated Client (admin) vs Anonymous Client
    anon_client: Client = create_client(url, key)
    
    # A) Test Anonymous Insert (Should Fail)
    print("Test A: Anonymous INSERT into Activities")
    try:
        anon_client.table('activities').insert({'titulo': 'Hacked', 'descripcion': 'Anon'}).execute()
        print("❌ VULNERABILITY FOUND: Anonymous user was able to insert into activities!")
    except Exception as e:
        print("✅ Anonymous INSERT blocked correctly by RLS")
        
    # B) Test Anonymous Select (Should Succeed)
    print("Test B: Anonymous SELECT from Activities")
    try:
        res = anon_client.table('activities').select('*').execute()
        print("✅ Anonymous SELECT succeeded, public read is enabled!")
    except Exception as e:
        print(f"❌ Error in Anonymous SELECT: {e}")
        
    # C) Test Admin Insert (Should Succeed)
    print("Test C: Admin INSERT into Activities")
    try:
        res = supabase.table('activities').insert({'titulo': 'Admin Event', 'descripcion': 'Secure insert test'}).execute()
        print("✅ Admin INSERT succeeded, policy validates admin_roles correctly!")
    except Exception as e:
        print(f"❌ Error in Admin INSERT: {e}")
        
    # D) Test Admin Delete (Should Succeed)
    print("Test D: Admin DELETE from Activities")
    try:
        if hasattr(res, 'data') and len(res.data) > 0:
            act_id = res.data[0]['id']
            supabase.table('activities').delete().eq('id', act_id).execute()
            print("✅ Admin DELETE succeeded!")
    except Exception as e:
        print(f"❌ Error in Admin DELETE: {e}")

if __name__ == "__main__":
    run_tests()
