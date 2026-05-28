import sys
import os
sys.path.insert(0, os.path.abspath("."))

import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_chat_analysis():
    print("\n--- Testing /api/analyze Endpoint ---")
    payload = {
        "message": "I want to upgrade my subscription to the enterprise tier. I am super excited about your service!",
        "conversation_id": "test-play-convo-1234",
        "user_id": "test-user-5678",
        "history": []
    }
    
    resp = client.post("/api/analyze", json=payload)
    print("Status Code:", resp.status_code)
    try:
        print("Response:", json.dumps(resp.json(), indent=2))
    except Exception as e:
        print("Error parsing response:", e, "Content:", resp.text)

def test_dashboard():
    print("\n--- Testing /api/dashboard Endpoint ---")
    resp = client.get("/api/dashboard")
    print("Status Code:", resp.status_code)
    try:
        print("Response:", json.dumps(resp.json(), indent=2))
    except Exception as e:
        print("Error parsing response:", e, "Content:", resp.text)

if __name__ == "__main__":
    test_chat_analysis()
    test_dashboard()
