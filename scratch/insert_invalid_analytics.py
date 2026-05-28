import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    print("\n--- Inserting invalid row into analytics_events ---")
    res = supabase.table("analytics_events").insert({"event_type": "test", "invalid_field": "garbage"}).execute()
    print("Success:", res.data)
except Exception as e:
    print("Error details:", e)
