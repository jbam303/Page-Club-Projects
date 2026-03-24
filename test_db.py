import os, psycopg2
from dotenv import load_dotenv

load_dotenv()
pwd = os.getenv("SUPABASE_PASSWORD")
user = os.getenv("SUPABASE_USER")
host = os.getenv("SUPABASE_URL")
port = os.getenv("SUPABASE_PORT")
db = os.getenv("SUPABASE_DATABASE")

def try_conn(port_num, ssl):
    url = f"postgresql://{user}:{pwd}@{host}:{port_num}/{db}?sslmode={ssl}"
    print(f"Trying: {url.replace(pwd, '***')}")
    try:
        conn = psycopg2.connect(url, connect_timeout=5)
        print("SUCCESS")
        conn.close()
    except Exception as e:
        print(f"FAILED: {e}")

try_conn("5432", "require")
try_conn("6543", "require")
try_conn("5432", "disable")
try_conn("6543", "disable")

