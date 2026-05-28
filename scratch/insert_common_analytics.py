import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Try common column configurations
candidates = [
    {"event_type": "test", "conversation_id": None},
    {"event_type": "test", "customer_id": None},
    {"event_type": "test", "user_id": None},
    {"event_type": "test", "value": 0.0},
    {"event_type": "test", "metric": "test"},
    {"event_type": "test", "revenue": 0.0},
]

for item in candidates:
    try:
        print(f"\nTrying insert: {item}")
        res = supabase.table("analytics_events").insert(item).execute()
        print("Success! Inserted row details:", res.data)
        if res.data:
            inserted_id = res.data[0].get("id")
            supabase.table("analytics_events").delete().eq("id", inserted_id).execute()
            print("Cleaned up successfully.")
    except Exception as e:
        print("Error:", e)
