import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    res = supabase.table("conversations").select("id", "final_sentiment").execute()
    print("Conversations count:", len(res.data))
    for r in res.data:
        val = r.get("final_sentiment")
        print(f"ID: {r.get('id')}, final_sentiment: {val} (type: {type(val)})")
except Exception as e:
    print("Error:", e)
