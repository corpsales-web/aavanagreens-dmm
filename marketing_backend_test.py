import requests
import sys
import json
from datetime import datetime
import time

class MarketingManagerAPITester:
    def __init__(self, base_url="https://crm-whatsapp-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.saved_ids = {}  # Track saved IDs for approval tests

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
                    # Show short response body as requested
                    if isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                        if 'saved_id' in response_data:
                            print(f"   Saved ID: {response_data['saved_id']}")
                    else:
                        print(f"   Response: Array with {len(response_data)} items")
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

    def test_create_brand_content(self):
        """Test POST /api/ai/content/create-brand"""
        brand_data = {
            "specifications": {
                "topic": "Aavana Greens Brand Refresh",
                "visual_style": "modern eco",
                "assets": ["Logo Suite", "Color Palette"]
            }
        }
        
        success, response = self.run_test(
            "Create Brand Content",
            "POST",
            "ai/content/create-brand",
            200,
            data=brand_data
        )
        
        if success:
            if response.get("success") and "brand_assets" in response and "saved_id" in response:
                print(f"   ✅ Brand content created with assets and saved_id")
                self.saved_ids['brand'] = response['saved_id']
                return True
            else:
                print(f"   ❌ Missing required fields: success, brand_assets, saved_id")
                return False
        
        return success

    def test_create_reel_content(self):
        """Test POST /api/ai/content/create-reel with minimal specs"""
        reel_data = {
            "specifications": {
                "topic": "Sustainable Gardening Tips",
                "duration": "30s",
                "style": "educational"
            }
        }
        
        success, response = self.run_test(
            "Create Reel Content",
            "POST",
            "ai/content/create-reel",
            200,
            data=reel_data
        )
        
        if success:
            if response.get("success") and "content" in response and "saved_id" in response:
                print(f"   ✅ Reel content created with content and saved_id")
                self.saved_ids['reel'] = response['saved_id']
                return True
            else:
                print(f"   ❌ Missing required fields: success, content, saved_id")
                return False
        
        return success

    def test_create_ugc_content(self):
        """Test POST /api/ai/content/create-ugc with minimal specs"""
        ugc_data = {
            "specifications": {
                "campaign_theme": "Green Living",
                "target_audience": "eco-conscious homeowners",
                "content_type": "testimonial"
            }
        }
        
        success, response = self.run_test(
            "Create UGC Content",
            "POST",
            "ai/content/create-ugc",
            200,
            data=ugc_data
        )
        
        if success:
            if response.get("success") and "campaign" in response and "saved_id" in response:
                print(f"   ✅ UGC content created with campaign and saved_id")
                self.saved_ids['ugc'] = response['saved_id']
                return True
            else:
                print(f"   ❌ Missing required fields: success, campaign, saved_id")
                return False
        
        return success

    def test_create_influencer_content(self):
        """Test POST /api/ai/content/create-influencer with minimal specs"""
        influencer_data = {
            "specifications": {
                "niche": "sustainable living",
                "follower_range": "10k-100k",
                "content_style": "authentic"
            }
        }
        
        success, response = self.run_test(
            "Create Influencer Content",
            "POST",
            "ai/content/create-influencer",
            200,
            data=influencer_data
        )
        
        if success:
            if response.get("success") and "influencer" in response and "saved_id" in response:
                print(f"   ✅ Influencer content created with influencer and saved_id")
                self.saved_ids['influencer'] = response['saved_id']
                return True
            else:
                print(f"   ❌ Missing required fields: success, influencer, saved_id")
                return False
        
        return success

    def test_launch_crossplatform_campaign(self):
        """Test POST /api/ai/campaigns/launch-crossplatform"""
        campaign_data = {
            "campaign_data": {
                "name": "Aavana Greens Summer Campaign",
                "objective": "brand_awareness",
                "budget": 50000
            },
            "platform_allocation": {
                "facebook": 40,
                "instagram": 35,
                "google": 25
            }
        }
        
        success, response = self.run_test(
            "Launch Cross-Platform Campaign",
            "POST",
            "ai/campaigns/launch-crossplatform",
            200,
            data=campaign_data
        )
        
        if success:
            if response.get("success") and "campaign_launch" in response and "saved_id" in response:
                print(f"   ✅ Campaign launched with campaign_launch and saved_id")
                self.saved_ids['campaign'] = response['saved_id']
                return True
            else:
                print(f"   ❌ Missing required fields: success, campaign_launch, saved_id")
                return False
        
        return success

    def test_get_brand_assets(self):
        """Test GET /api/marketing/brand-assets"""
        success, response = self.run_test(
            "Get Brand Assets",
            "GET",
            "marketing/brand-assets",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"   ✅ Brand assets returned as array with {len(response)} items")
                # Check if latest saved brand asset is present
                if self.saved_ids.get('brand'):
                    found = any(item.get('id') == self.saved_ids['brand'] for item in response)
                    if found:
                        print(f"   ✅ Latest saved brand asset found in list")
                    else:
                        print(f"   ⚠️  Latest saved brand asset not found in list")
                return True
            else:
                print(f"   ❌ Expected array, got: {type(response)}")
                return False
        
        return success

    def test_get_marketing_lists(self):
        """Test GET endpoints for reels, ugc, influencers, campaigns"""
        endpoints = [
            ("marketing/reels", "reels"),
            ("marketing/ugc", "ugc"),
            ("marketing/influencers", "influencers"),
            ("marketing/campaigns", "campaigns")
        ]
        
        all_success = True
        
        for endpoint, name in endpoints:
            success, response = self.run_test(
                f"Get Marketing {name.title()}",
                "GET",
                endpoint,
                200
            )
            
            if success:
                if isinstance(response, list):
                    print(f"   ✅ {name.title()} returned as array with {len(response)} items")
                    # Check if arrays are non-empty after posts
                    if len(response) > 0:
                        print(f"   ✅ {name.title()} array is non-empty")
                    else:
                        print(f"   ⚠️  {name.title()} array is empty")
                else:
                    print(f"   ❌ Expected array, got: {type(response)}")
                    all_success = False
            else:
                all_success = False
        
        return all_success

    def test_approve_marketing_content(self):
        """Test POST /api/marketing/approve"""
        # Use the most recent campaign ID if available
        if not self.saved_ids.get('campaign'):
            print(f"   ⚠️  No campaign ID available for approval test")
            return False
        
        approval_data = {
            "type": "campaign",
            "id": self.saved_ids['campaign'],
            "targeting": {
                "geography": {
                    "city": ["Mumbai"],
                    "state": ["MH"]
                },
                "demographics": {
                    "gender": ["male", "female"],
                    "age": ["25-45"]
                },
                "behavior": {
                    "interests": ["gardening", "eco"]
                },
                "schedule": {
                    "weekly": ["Mon", "Fri"]
                }
            }
        }
        
        success, response = self.run_test(
            "Approve Marketing Content",
            "POST",
            "marketing/approve",
            200,
            data=approval_data
        )
        
        if success:
            if response.get("success") and response.get("approved"):
                print(f"   ✅ Marketing content approved successfully")
                return True
            else:
                print(f"   ❌ Missing required fields: success=true, approved=true")
                return False
        
        return success

def main():
    print("🚀 Starting Marketing Manager Backend API Tests")
    print("🎯 Testing Marketing Manager Updates - Backend APIs")
    print("=" * 80)
    
    tester = MarketingManagerAPITester()
    
    # Marketing Manager Backend API Tests
    print("\n📱 MARKETING MANAGER API TESTS")
    print("=" * 50)
    
    marketing_tests = [
        ("Create Brand Content", tester.test_create_brand_content),
        ("Create Reel Content", tester.test_create_reel_content),
        ("Create UGC Content", tester.test_create_ugc_content),
        ("Create Influencer Content", tester.test_create_influencer_content),
        ("Launch Cross-Platform Campaign", tester.test_launch_crossplatform_campaign),
        ("Get Brand Assets", tester.test_get_brand_assets),
        ("Get Marketing Lists", tester.test_get_marketing_lists),
        ("Approve Marketing Content", tester.test_approve_marketing_content),
    ]
    
    # Run all tests
    results = {}
    
    for test_name, test_func in marketing_tests:
        try:
            print(f"\n" + "-" * 60)
            results[test_name] = test_func()
            # Small delay between tests
            time.sleep(0.5)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            results[test_name] = False
            tester.tests_run += 1
    
    # Print comprehensive summary
    print("\n" + "=" * 80)
    print("📊 MARKETING MANAGER BACKEND API TEST SUMMARY")
    print("=" * 80)
    
    print("\n📱 MARKETING API RESULTS:")
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name}: {status}")
    
    # Overall summary
    total_passed = sum(results.values())
    total_tests = len(results)
    
    print(f"\n🎯 OVERALL RESULTS:")
    print(f"   Tests Passed: {total_passed}/{total_tests}")
    print(f"   Success Rate: {(total_passed/total_tests)*100:.1f}%")
    
    if tester.saved_ids:
        print(f"   Saved IDs: {tester.saved_ids}")
    
    # Determine exit code
    if total_passed >= total_tests * 0.7:  # 70% success rate for marketing features
        print("\n🎉 Marketing Manager backend API testing completed!")
        print("✅ Ready for frontend UI testing")
        return 0
    else:
        print("\n⚠️  Critical marketing API tests failed!")
        print("❌ Frontend testing may encounter issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())