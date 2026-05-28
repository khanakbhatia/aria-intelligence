import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

print(f"Supabase URL: {SUPABASE_URL}")
print(f"Supabase Key: {SUPABASE_KEY[:15]}...")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    print("Testing connection to profiles table...")
    res = supabase.table("profiles").select("*").limit(1).execute()
    print("Success profiles:", res.data)
except Exception as e:
    print("Error querying profiles table:", e)

try:
    print("Testing connection to conversations table...")
    res = supabase.table("conversations").select("*").limit(1).execute()
    print("Success conversations:", res.data)
except Exception as e:
    print("Error querying conversations table:", e)
