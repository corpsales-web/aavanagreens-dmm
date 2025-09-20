import requests
import sys
import json
from datetime import datetime
import time

class AavanaCRMAPITester:
    def __init__(self, base_url="https://greens-dashboard.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_leads = []  # Track created leads for cleanup

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)
            else:
                print(f"❌ Unsupported method: {method}")
                return False, {}

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Array with ' + str(len(response_data)) + ' items'}")
                    return True, response_data
                except:
                    print(f"   Response (text): {response.text[:200]}...")
                    return True, {"text": response.text}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error (text): {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_api(self):
        """Test GET /api/ -> expect 200 JSON with message"""
        success, response = self.run_test(
            "Root API",
            "GET",
            "",
            200
        )
        
        if success and isinstance(response, dict) and "message" in response:
            print(f"   ✅ Root API working: {response['message']}")
        elif success:
            print(f"   ⚠️  Root API responded but unexpected format: {response}")
        
        return success

    def test_dashboard_stats(self):
        """Test GET /api/dashboard/stats -> expect 200 with keys total_leads, new_leads, qualified_leads, etc."""
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            expected_keys = ['total_leads', 'new_leads', 'qualified_leads', 'won_deals', 'lost_deals', 'total_revenue', 'pending_tasks', 'conversion_rate']
            missing_keys = [key for key in expected_keys if key not in response]
            
            if not missing_keys:
                print(f"   ✅ All expected keys present")
                print(f"   📊 Stats: {response['total_leads']} leads, {response['qualified_leads']} qualified, {response['conversion_rate']}% conversion")
            else:
                print(f"   ⚠️  Missing keys: {missing_keys}")
                print(f"   📊 Available keys: {list(response.keys())}")
        
        return success

    def test_optimized_lead_creation(self):
        """Test POST /api/leads/optimized-create with realistic payload"""
        test_lead = {
            "name": "Test Customer",
            "email": f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
            "phone": "9876543210",
            "qualification_score": 85,
            "status": "Qualified",
            "project_type": "Residential",
            "budget_range": "50k_100k",
            "timeline": "3_months",
            "location": "Mumbai",
            "city": "Mumbai",
            "state": "Maharashtra",
            "requirements": "Looking for sustainable balcony garden design",
            "decision_maker": "Self",
            "urgency": "high"
        }
        
        success, response = self.run_test(
            "Optimized Lead Creation",
            "POST",
            "leads/optimized-create",
            201,
            data=test_lead
        )
        
        if success:
            if "success" in response and response["success"]:
                print(f"   ✅ Lead created successfully")
                if "lead" in response and "id" in response["lead"]:
                    print(f"   📝 Lead ID: {response['lead']['id']}")
                if "auto_converted_to_deal" in response:
                    print(f"   🔄 Auto-converted to deal: {response['auto_converted_to_deal']}")
                if "qualification_summary" in response:
                    qual = response["qualification_summary"]
                    print(f"   🎯 Qualification: {qual.get('score', 'N/A')}/100, Level: {qual.get('level', 'N/A')}")
            else:
                print(f"   ❌ Unexpected response format: {response}")
                success = False
        
        return success

    def test_leads_list(self):
        """Test GET /api/leads?limit=10 -> 200 array"""
        success, response = self.run_test(
            "Leads List",
            "GET",
            "leads?limit=10",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"   ✅ Leads list returned: {len(response)} leads")
                if len(response) > 0:
                    lead = response[0]
                    if "id" in lead and "name" in lead:
                        print(f"   📋 Sample lead: {lead['name']} (ID: {lead['id']})")
                    else:
                        print(f"   ⚠️  Lead missing required fields: {list(lead.keys())}")
                else:
                    print(f"   ℹ️  No leads in database (empty state is fine)")
            else:
                print(f"   ❌ Expected array, got: {type(response)}")
                success = False
        
        return success

def main():
    print("🚀 Starting Aavana CRM Backend API Tests")
    print("=" * 60)
    
    tester = AavanaCRMAPITester()
    
    # Run tests as specified in review request
    tests = [
        ("Root API", tester.test_root_api),
        ("Dashboard Stats", tester.test_dashboard_stats),
        ("Optimized Lead Creation", tester.test_optimized_lead_creation),
        ("Leads List", tester.test_leads_list),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            results[test_name] = False
            tester.tests_run += 1
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 BACKEND API TEST SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nOverall: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend API tests passed!")
        return 0
    else:
        print("⚠️  Some backend API tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())