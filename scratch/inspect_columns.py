import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

additional_tables = ["escalations", "analytics_events", "users", "customer_profiles"]

# Inspect escalations columns
try:
    print("\n--- Columns in escalations ---")
    # Insert a dummy record or select empty
    res = supabase.table("escalations").select("*").limit(1).execute()
    print("Success! Data:", res.data)
except Exception as e:
    print("Error:", e)

# Inspect analytics_events
try:
    print("\n--- Table: analytics_events ---")
    res = supabase.table("analytics_events").select("*").limit(1).execute()
    print("Success! Data:", res.data)
except Exception as e:
    print("Error:", e)

# Inspect users
try:
    print("\n--- Table: users ---")
    res = supabase.table("users").select("*").limit(1).execute()
    print("Success! Data:", res.data)
except Exception as e:
    print("Error:", e)
