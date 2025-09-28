#!/usr/bin/env python3
"""
Marketing Approval Flow Smoke Test
Specific test for the review request: Save manual strategy → List strategies → Approve strategy
"""

import requests
import json
import sys
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:8002"
HEADERS = {"Content-Type": "application/json"}

def log_result(step, status, details=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_symbol = "✅" if status == "PASS" else "❌"
    print(f"[{timestamp}] {status_symbol} {step}")
    if details:
        print(f"    {details}")

def smoke_test_marketing_approval_flow():
    """
    SMOKE TEST: Non-AI approval flow end-to-end
    1) Save manual strategy via POST /api/marketing/save
    2) List strategies via GET /api/marketing/list?type=strategy  
    3) Approve the strategy via POST /api/marketing/approve
    """
    print("=" * 60)
    print("SMOKE TEST: Marketing Approval Flow (Non-AI)")
    print("=" * 60)
    
    # Step 1: Save manual strategy
    print("\n1️⃣ Saving manual strategy...")
    try:
        payload = {
            "item_type": "strategy",
            "data": {
                "company_name": "Aavana",
                "industry": "Real Estate", 
                "target_audience": "Home buyers",
                "strategy_content": "(AI pending — created manually)"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/marketing/save", 
                               json=payload, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "item" in data:
                strategy_id = data["item"].get("id")
                if strategy_id:
                    log_result("Save Manual Strategy", "PASS", 
                             f"Strategy saved with ID: {strategy_id}")
                else:
                    log_result("Save Manual Strategy", "FAIL", "No ID returned")
                    return False
            else:
                log_result("Save Manual Strategy", "FAIL", f"Unexpected response: {data}")
                return False
        else:
            log_result("Save Manual Strategy", "FAIL", 
                     f"HTTP {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_result("Save Manual Strategy", "FAIL", f"Error: {str(e)}")
        return False
    
    # Step 2: List strategies and verify the saved strategy is present
    print("\n2️⃣ Listing strategies...")
    try:
        response = requests.get(f"{BASE_URL}/api/marketing/list?type=strategy", timeout=10)
        
        if response.status_code == 200:
            strategies = response.json()
            if isinstance(strategies, list):
                # Check if our strategy is in the list
                found_strategy = None
                for strategy in strategies:
                    if strategy.get("id") == strategy_id:
                        found_strategy = strategy
                        break
                
                if found_strategy:
                    log_result("List Strategies", "PASS", 
                             f"Found {len(strategies)} strategies, including our saved strategy")
                else:
                    log_result("List Strategies", "FAIL", 
                             f"Saved strategy ID {strategy_id} not found in list")
                    return False
            else:
                log_result("List Strategies", "FAIL", f"Expected list, got: {type(strategies)}")
                return False
        else:
            log_result("List Strategies", "FAIL", 
                     f"HTTP {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_result("List Strategies", "FAIL", f"Error: {str(e)}")
        return False
    
    # Step 3: Approve the strategy
    print("\n3️⃣ Approving strategy...")
    try:
        payload = {
            "item_type": "strategy",
            "item_id": strategy_id,
            "status": "Approved",
            "filters": {
                "geo": "US",
                "language": ["English"],
                "device": ["mobile", "desktop"]
            },
            "approved_by": "smoke_test"
        }
        
        response = requests.post(f"{BASE_URL}/api/marketing/approve", 
                               json=payload, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "item" in data:
                approved_item = data["item"]
                if approved_item.get("status") == "Approved":
                    log_result("Approve Strategy", "PASS", 
                             f"Strategy {strategy_id} successfully approved")
                else:
                    log_result("Approve Strategy", "FAIL", 
                             f"Status not updated: {approved_item.get('status')}")
                    return False
            else:
                log_result("Approve Strategy", "FAIL", f"Unexpected response: {data}")
                return False
        else:
            log_result("Approve Strategy", "FAIL", 
                     f"HTTP {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_result("Approve Strategy", "FAIL", f"Error: {str(e)}")
        return False
    
    # Success!
    print("\n" + "=" * 60)
    print("🎉 SMOKE TEST COMPLETED SUCCESSFULLY!")
    print("✅ Manual strategy saved")
    print("✅ Strategy found in list")  
    print("✅ Strategy approved with filters")
    print("=" * 60)
    return True

def main():
    """Run the smoke test"""
    success = smoke_test_marketing_approval_flow()
    
    if success:
        print("\n✅ Marketing approval flow working correctly!")
        return 0
    else:
        print("\n❌ Marketing approval flow has issues!")
        return 1

if __name__ == "__main__":
    sys.exit(main())