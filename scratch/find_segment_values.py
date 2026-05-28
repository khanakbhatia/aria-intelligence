import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

segments = ["standard", "vip", "growth", "enterprise", "premium"]

for segment in segments:
    try:
        print(f"\nTrying insert into customer_profiles with segment: {segment}")
        res = supabase.table("customer_profiles").insert({
            "name": f"Test {segment}",
            "segment": segment
        }).execute()
        print(f"Success for segment {segment}!")
        if res.data:
            inserted_id = res.data[0].get("id")
            supabase.table("customer_profiles").delete().eq("id", inserted_id).execute()
            print("Cleaned up successfully.")
    except Exception as e:
        print(f"Error for segment {segment}: {e}")
