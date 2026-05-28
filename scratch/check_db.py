import asyncio
from app.core.supabase_client import supabase

async def test():
    try:
        print("Testing Supabase connection for active tables...")
        
        # Check customer_profiles table
        resp = supabase.table("customer_profiles").select("*").limit(1).execute()
        print("customer_profiles structure:", resp.data[0] if resp.data else "No rows (empty)")
        
        # Check conversations table
        resp = supabase.table("conversations").select("*").limit(1).execute()
        print("conversations structure:", resp.data[0] if resp.data else "No rows (empty)")
        
        # Check messages table
        resp = supabase.table("messages").select("*").limit(1).execute()
        print("messages structure:", resp.data[0] if resp.data else "No rows (empty)")
        
        # Check escalations table
        resp = supabase.table("escalations").select("*").limit(1).execute()
        print("escalations structure:", resp.data[0] if resp.data else "No rows (empty)")
    except Exception as e:
        print("Supabase check failed:", e)

if __name__ == "__main__":
    asyncio.run(test())
