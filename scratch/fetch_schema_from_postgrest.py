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

# The REST API endpoint is SUPABASE_URL + "/rest/v1/"
url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/"

try:
    print(f"Fetching PostgREST schema from {url}...")
    resp = requests.get(url, headers=headers)
    if resp.status_code == 200:
        schema = resp.json()
        print("Schema successfully fetched!")
        
        # Save schema to a file for reference
        with open("scratch/db_schema.json", "w") as f:
            json.dump(schema, f, indent=2)
            
        print("\n--- Tables and Columns in Schema ---")
        definitions = schema.get("definitions", {})
        for table_name, definition in definitions.items():
            print(f"\nTable: {table_name}")
            properties = definition.get("properties", {})
            required = definition.get("required", [])
            for col_name, col_info in properties.items():
                req_str = " (Required)" if col_name in required else ""
                col_type = col_info.get("type", "unknown")
                description = col_info.get("description", "")
                desc_str = f" - {description}" if description else ""
                print(f"  - {col_name}: {col_type}{req_str}{desc_str}")
    else:
        print(f"Error fetching schema: {resp.status_code} - {resp.text}")
except Exception as e:
    print("Error:", e)
