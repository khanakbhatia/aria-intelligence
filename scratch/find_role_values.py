import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Try inserting into messages with role as 'assistant' and 'agent'
roles = ["assistant", "agent", "system", "aria"]

# We'll use a valid conversation ID from the existing rows: ec3b735c-0d1c-4ab1-a633-29dd8995d526
valid_convo_id = "ec3b735c-0d1c-4ab1-a633-29dd8995d526"

for role in roles:
    try:
        print(f"\nTrying insert into messages with role: {role}")
        res = supabase.table("messages").insert({
            "conversation_id": valid_convo_id,
            "role": role,
            "content": f"Test message for role {role}"
        }).execute()
        print(f"Success for role {role}!")
        if res.data:
            inserted_id = res.data[0].get("id")
            supabase.table("messages").delete().eq("id", inserted_id).execute()
            print("Cleaned up successfully.")
    except Exception as e:
        print(f"Error for role {role}: {e}")
