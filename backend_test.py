import requests
import sys
import json
from datetime import datetime

class BackendAPITester:
    def __init__(self, base_url="https://greens-dashboard.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

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
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
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
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
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

    def test_health_endpoint(self):
        """Test the health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        
        if success:
            # Validate response structure
            if "status" in response and "db" in response:
                if response["status"] == "ok":
                    if response["db"] == "ok":
                        print("   ✅ Database connection healthy")
                    elif response["db"].startswith("error:"):
                        print(f"   ⚠️  Database connection issue: {response['db']}")
                    else:
                        print(f"   ⚠️  Unexpected db status: {response['db']}")
                else:
                    print(f"   ❌ Unexpected status: {response['status']}")
            else:
                print("   ❌ Missing required fields in health response")
                success = False
        
        return success

    def test_gallery_seed(self):
        """Test gallery seeding endpoint"""
        test_data = {
            "count": 3,
            "reset": True
        }
        
        success, response = self.run_test(
            "Gallery Seed",
            "POST",
            "gallery/seed",
            200,
            data=test_data
        )
        
        if success:
            if "inserted" in response and response["inserted"] == 3:
                print("   ✅ Gallery seeded successfully with correct count")
            else:
                print(f"   ❌ Unexpected response format or count: {response}")
                success = False
        
        return success

    def test_lead_qualification(self):
        """Test lead qualification endpoint"""
        test_lead = {
            "lead": {
                "name": "Test Lead",
                "email": "test@example.com",
                "phone": "9876543210",
                "notes": "Looking to buy in Oct, budget 50L",
                "source": "Referral"
            }
        }
        
        success, response = self.run_test(
            "Lead Qualification",
            "POST",
            "leads/qualify",
            200,
            data=test_lead
        )
        
        if success:
            required_fields = ["score", "stage", "reasoning", "model_used"]
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                # Validate field types and values
                if isinstance(response["score"], (int, float)):
                    print(f"   ✅ Score: {response['score']}")
                else:
                    print(f"   ❌ Score should be a number, got: {type(response['score'])}")
                    success = False
                
                if response["stage"] in ["New", "Contacted", "Qualified"]:
                    print(f"   ✅ Stage: {response['stage']}")
                else:
                    print(f"   ❌ Invalid stage: {response['stage']}")
                    success = False
                
                if isinstance(response["reasoning"], str) and response["reasoning"]:
                    print(f"   ✅ Reasoning: {response['reasoning'][:50]}...")
                else:
                    print(f"   ❌ Reasoning should be a non-empty string")
                    success = False
                
                if isinstance(response["model_used"], str) and response["model_used"]:
                    print(f"   ✅ Model: {response['model_used']}")
                else:
                    print(f"   ❌ Model should be a non-empty string")
                    success = False
            else:
                print(f"   ❌ Missing required fields: {missing_fields}")
                success = False
        
        return success

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test(
            "Root API",
            "GET",
            "",
            200
        )
        
        if success and "message" in response:
            print(f"   ✅ Root endpoint working: {response['message']}")
        elif success:
            print(f"   ⚠️  Root endpoint responded but unexpected format: {response}")
        
        return success

def main():
    print("🚀 Starting Backend API Tests")
    print("=" * 50)
    
    tester = BackendAPITester()
    
    # Run all tests
    tests = [
        ("Root API", tester.test_root_endpoint),
        ("Health Check", tester.test_health_endpoint),
        ("Gallery Seed", tester.test_gallery_seed),
        ("Lead Qualification", tester.test_lead_qualification),
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
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nOverall: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print("⚠️  Some backend tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())