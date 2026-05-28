import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

tables = ["escalations", "analytics_events", "customer_profiles"]

for table in tables:
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{table}"
    try:
        print(f"\nSending OPTIONS to {url}...")
        resp = requests.options(url, headers=headers)
        if resp.status_code == 200:
            print(f"Success {table}!")
            # The response body for OPTIONS might contain the schema
            try:
                print(json.dumps(resp.json(), indent=2))
            except Exception:
                # Or headers might contain the structure, or the response content is different
                print("Content:", resp.text[:1000])
        else:
            print(f"Error {table}: {resp.status_code} - {resp.text}")
    except Exception as e:
        print("Error:", e)
