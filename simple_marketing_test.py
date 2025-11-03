import requests
import sys
import json
from datetime import datetime
import time

class SimpleMarketingTester:
    def __init__(self, base_url="https://campaign-manager-28.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=10):
        """Run a single API test with shorter timeout"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
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
                    if isinstance(response_data, list):
                        print(f"   Response: Array with {len(response_data)} items")
                    else:
                        print(f"   Response keys: {list(response_data.keys())}")
                    return True, response_data
                except:
                    print(f"   Response (text): {response.text[:100]}...")
                    return True, {"text": response.text}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error (text): {response.text[:100]}...")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"⏰ Timeout after {timeout}s - API may be processing AI request")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_marketing_lists(self):
        """Test GET endpoints for marketing lists"""
        endpoints = [
            ("marketing/brand-assets", "Brand Assets"),
            ("marketing/reels", "Reels"),
            ("marketing/ugc", "UGC"),
            ("marketing/influencers", "Influencers"),
            ("marketing/campaigns", "Campaigns")
        ]
        
        results = {}
        
        for endpoint, name in endpoints:
            success, response = self.run_test(
                f"Get {name}",
                "GET",
                endpoint,
                200,
                timeout=5  # Short timeout for GET requests
            )
            results[name] = success
            
            if success and isinstance(response, list):
                print(f"   ✅ {name} list returned {len(response)} items")
            
            time.sleep(0.5)  # Small delay between requests
        
        return all(results.values()), results

def main():
    print("🚀 Simple Marketing Manager Backend Test")
    print("🎯 Testing basic marketing endpoints")
    print("=" * 60)
    
    tester = SimpleMarketingTester()
    
    # Test basic marketing list endpoints
    print("\n📱 MARKETING LIST ENDPOINTS")
    print("-" * 40)
    
    list_success, list_results = tester.test_marketing_lists()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 SIMPLE MARKETING TEST SUMMARY")
    print("=" * 60)
    
    print(f"\n📱 MARKETING LIST RESULTS:")
    for endpoint, passed in list_results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {endpoint}: {status}")
    
    # Overall summary
    total_passed = tester.tests_passed
    total_tests = tester.tests_run
    
    print(f"\n🎯 OVERALL RESULTS:")
    print(f"   Tests Passed: {total_passed}/{total_tests}")
    print(f"   Success Rate: {(total_passed/total_tests)*100:.1f}%")
    
    if total_passed >= total_tests * 0.6:  # 60% success rate
        print("\n🎉 Basic marketing endpoints working!")
        return 0
    else:
        print("\n⚠️  Some marketing endpoints failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())