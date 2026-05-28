import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

tables = ["customer_profiles", "escalations", "analytics_events"]

for table in tables:
    try:
        print(f"\n--- Inserting empty row into {table} ---")
        # Try inserting empty dict to trigger default values and return the row
        res = supabase.table(table).insert({}).execute()
        print("Success! Inserted row:", res.data)
        
        # Clean it up if it inserted successfully so we don't leave garbage
        if res.data:
            inserted_id = res.data[0].get("id")
            if inserted_id:
                supabase.table(table).delete().eq("id", inserted_id).execute()
                print(f"Cleaned up inserted row with id {inserted_id}")
    except Exception as e:
        print(f"Error inserting into {table}: {e}")
