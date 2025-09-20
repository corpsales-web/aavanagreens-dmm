import requests
import json
import time

def test_marketing_endpoints():
    base_url = "http://localhost:8001/api"
    
    print("🚀 Testing Marketing Endpoints Locally")
    print("=" * 50)
    
    # Test 1: Create Brand Content
    print("\n1. Testing Brand Content Creation...")
    brand_data = {"topic": "Brand Refresh"}
    try:
        response = requests.post(f"{base_url}/ai/content/create-brand", json=brand_data, timeout=30)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success: {data.get('success')}")
            print(f"   📝 Saved ID: {data.get('saved_id')}")
            brand_id = data.get('saved_id')
        else:
            print(f"   ❌ Failed: {response.text[:200]}")
            brand_id = None
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        brand_id = None
    
    time.sleep(2)
    
    # Test 2: Create Reel Content
    print("\n2. Testing Reel Content Creation...")
    reel_data = {"theme": "Sustainable Garden Tips"}
    try:
        response = requests.post(f"{base_url}/ai/content/create-reel", json=reel_data, timeout=30)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success: {data.get('success')}")
            print(f"   📝 Saved ID: {data.get('saved_id')}")
            reel_id = data.get('saved_id')
        else:
            print(f"   ❌ Failed: {response.text[:200]}")
            reel_id = None
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        reel_id = None
    
    time.sleep(2)
    
    # Test 3: Create UGC Content
    print("\n3. Testing UGC Content Creation...")
    ugc_data = {"campaign_name": "Green Stories"}
    try:
        response = requests.post(f"{base_url}/ai/content/create-ugc", json=ugc_data, timeout=30)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success: {data.get('success')}")
            print(f"   📝 Saved ID: {data.get('saved_id')}")
            ugc_id = data.get('saved_id')
        else:
            print(f"   ❌ Failed: {response.text[:200]}")
            ugc_id = None
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        ugc_id = None
    
    time.sleep(2)
    
    # Test 4: Create Influencer Content
    print("\n4. Testing Influencer Content Creation...")
    influencer_data = {"campaign_type": "Home & Garden Partnership"}
    try:
        response = requests.post(f"{base_url}/ai/content/create-influencer", json=influencer_data, timeout=30)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success: {data.get('success')}")
            print(f"   📝 Saved ID: {data.get('saved_id')}")
            influencer_id = data.get('saved_id')
        else:
            print(f"   ❌ Failed: {response.text[:200]}")
            influencer_id = None
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        influencer_id = None
    
    time.sleep(2)
    
    # Test 5: Launch Cross-Platform Campaign
    print("\n5. Testing Cross-Platform Campaign Launch...")
    campaign_data = {"campaign_name": "Spring Garden 2024", "platforms": ["Instagram", "Facebook"]}
    try:
        response = requests.post(f"{base_url}/ai/campaigns/launch-crossplatform", json=campaign_data, timeout=30)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success: {data.get('success')}")
            print(f"   📝 Saved ID: {data.get('saved_id')}")
            campaign_id = data.get('saved_id')
        else:
            print(f"   ❌ Failed: {response.text[:200]}")
            campaign_id = None
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        campaign_id = None
    
    time.sleep(2)
    
    # Test 6: Marketing Approve (if we have a campaign ID)
    if campaign_id:
        print("\n6. Testing Marketing Approval...")
        approve_data = {
            "type": "campaign",
            "id": campaign_id,
            "targeting": {"demographics": {"age_range": "25-55"}}
        }
        try:
            response = requests.post(f"{base_url}/marketing/approve", json=approve_data, timeout=15)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Success: {data.get('success')}")
            else:
                print(f"   ❌ Failed: {response.text[:200]}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    else:
        print("\n6. Skipping Marketing Approval (no campaign ID)")
    
    # Test 7: Verify Lists
    print("\n7. Testing Marketing Lists...")
    lists = ["brand-assets", "reels", "ugc", "influencers", "campaigns"]
    
    for list_name in lists:
        try:
            response = requests.get(f"{base_url}/marketing/{list_name}", timeout=10)
            print(f"   {list_name}: Status {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"     ✅ Found {len(data)} items")
            else:
                print(f"     ❌ Failed")
        except Exception as e:
            print(f"     ❌ Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Marketing Endpoints Test Complete!")

if __name__ == "__main__":
    test_marketing_endpoints()