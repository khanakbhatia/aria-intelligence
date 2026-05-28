import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

tables = ["customer_profiles", "conversations", "messages", "analytics_daily", "escalations", "agents", "daily_metrics"]

for table in tables:
    try:
        print(f"\n--- Table: {table} ---")
        res = supabase.table(table).select("*").limit(1).execute()
        print("Success! Data preview:", res.data)
    except Exception as e:
        print(f"Error querying {table}: {e}")
