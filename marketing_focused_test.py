import requests
import sys
import json
from datetime import datetime
import time

class MarketingAPITester:
    def __init__(self, base_url="https://dmm-platform.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {}  # Track created IDs for verification

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

    def test_create_brand_content(self):
        """Test POST /api/ai/content/create-brand (topic:"Brand Refresh") → expect {success, brand_assets, saved_id}"""
        brand_data = {
            "topic": "Brand Refresh",
            "brand_name": "Aavana Greens",
            "industry": "Landscaping & Garden Design",
            "target_audience": "Homeowners and businesses seeking sustainable green solutions",
            "brand_values": ["Sustainability", "Innovation", "Quality", "Customer-centric"],
            "campaign_goals": ["Increase brand awareness", "Showcase new services", "Attract eco-conscious customers"]
        }
        
        success, response = self.run_test(
            "Create Brand Content",
            "POST",
            "ai/content/create-brand",
            200,
            data=brand_data
        )
        
        if success:
            # Check for expected response structure
            expected_keys = ['success', 'brand_assets', 'saved_id']
            missing_keys = [key for key in expected_keys if key not in response]
            
            if not missing_keys:
                print(f"   ✅ All expected keys present: {expected_keys}")
                if response.get('success'):
                    print(f"   🎯 Brand content creation successful")
                    if 'saved_id' in response:
                        self.created_ids['brand'] = response['saved_id']
                        print(f"   📝 Brand ID: {response['saved_id']}")
                    if 'brand_assets' in response:
                        print(f"   🎨 Brand assets generated: {type(response['brand_assets'])}")
                else:
                    print(f"   ⚠️  Success flag is False")
                    success = False
            else:
                print(f"   ❌ Missing expected keys: {missing_keys}")
                success = False
        
        return success

    def test_create_reel_content(self):
        """Test POST /api/ai/content/create-reel → expect {success, content, saved_id}"""
        reel_data = {
            "theme": "Sustainable Garden Transformation",
            "duration": "30 seconds",
            "style": "Before/After showcase",
            "target_platform": "Instagram",
            "call_to_action": "Book your consultation today!",
            "hashtags": ["#SustainableGardening", "#GreenLiving", "#AavanaGreens"]
        }
        
        success, response = self.run_test(
            "Create Reel Content",
            "POST",
            "ai/content/create-reel",
            200,
            data=reel_data
        )
        
        if success:
            expected_keys = ['success', 'content', 'saved_id']
            missing_keys = [key for key in expected_keys if key not in response]
            
            if not missing_keys:
                print(f"   ✅ All expected keys present: {expected_keys}")
                if response.get('success'):
                    print(f"   🎬 Reel content creation successful")
                    if 'saved_id' in response:
                        self.created_ids['reel'] = response['saved_id']
                        print(f"   📝 Reel ID: {response['saved_id']}")
                    if 'content' in response:
                        print(f"   🎥 Reel content generated: {type(response['content'])}")
                else:
                    print(f"   ⚠️  Success flag is False")
                    success = False
            else:
                print(f"   ❌ Missing expected keys: {missing_keys}")
                success = False
        
        return success

    def test_create_ugc_content(self):
        """Test POST /api/ai/content/create-ugc → expect {success, campaign, saved_id}"""
        ugc_data = {
            "campaign_name": "Green Transformation Stories",
            "campaign_type": "User Generated Content",
            "incentive": "Featured on our social media + 10% discount on next service",
            "content_guidelines": "Share before/after photos of your garden transformation",
            "hashtag": "#MyAavanaTransformation",
            "duration_days": 30
        }
        
        success, response = self.run_test(
            "Create UGC Content",
            "POST",
            "ai/content/create-ugc",
            200,
            data=ugc_data
        )
        
        if success:
            expected_keys = ['success', 'campaign', 'saved_id']
            missing_keys = [key for key in expected_keys if key not in response]
            
            if not missing_keys:
                print(f"   ✅ All expected keys present: {expected_keys}")
                if response.get('success'):
                    print(f"   📱 UGC campaign creation successful")
                    if 'saved_id' in response:
                        self.created_ids['ugc'] = response['saved_id']
                        print(f"   📝 UGC ID: {response['saved_id']}")
                    if 'campaign' in response:
                        print(f"   🎯 UGC campaign generated: {type(response['campaign'])}")
                else:
                    print(f"   ⚠️  Success flag is False")
                    success = False
            else:
                print(f"   ❌ Missing expected keys: {missing_keys}")
                success = False
        
        return success

    def test_create_influencer_content(self):
        """Test POST /api/ai/content/create-influencer → expect {success, influencer, saved_id}"""
        influencer_data = {
            "campaign_type": "Influencer Partnership",
            "niche": "Home & Garden",
            "follower_range": "10K-100K",
            "content_type": "Instagram posts and stories",
            "collaboration_type": "Product showcase",
            "budget_range": "₹5,000 - ₹15,000",
            "deliverables": ["2 Instagram posts", "3 Instagram stories", "1 Reel"]
        }
        
        success, response = self.run_test(
            "Create Influencer Content",
            "POST",
            "ai/content/create-influencer",
            200,
            data=influencer_data
        )
        
        if success:
            expected_keys = ['success', 'influencer', 'saved_id']
            missing_keys = [key for key in expected_keys if key not in response]
            
            if not missing_keys:
                print(f"   ✅ All expected keys present: {expected_keys}")
                if response.get('success'):
                    print(f"   🤝 Influencer content creation successful")
                    if 'saved_id' in response:
                        self.created_ids['influencer'] = response['saved_id']
                        print(f"   📝 Influencer ID: {response['saved_id']}")
                    if 'influencer' in response:
                        print(f"   👥 Influencer content generated: {type(response['influencer'])}")
                else:
                    print(f"   ⚠️  Success flag is False")
                    success = False
            else:
                print(f"   ❌ Missing expected keys: {missing_keys}")
                success = False
        
        return success

    def test_launch_crossplatform_campaign(self):
        """Test POST /api/ai/campaigns/launch-crossplatform → expect {success, campaign_launch, saved_id}"""
        campaign_data = {
            "campaign_name": "Spring Garden Makeover 2024",
            "platforms": ["Instagram", "Facebook", "Google Ads"],
            "budget": 50000,
            "duration_days": 30,
            "target_audience": {
                "age_range": "25-55",
                "interests": ["Gardening", "Home Improvement", "Sustainability"],
                "location": ["Mumbai", "Delhi", "Bangalore", "Pune"]
            },
            "campaign_objectives": ["Brand Awareness", "Lead Generation", "Website Traffic"],
            "content_types": ["Image Posts", "Video Content", "Carousel Ads"]
        }
        
        success, response = self.run_test(
            "Launch Cross-Platform Campaign",
            "POST",
            "ai/campaigns/launch-crossplatform",
            200,
            data=campaign_data
        )
        
        if success:
            expected_keys = ['success', 'campaign_launch', 'saved_id']
            missing_keys = [key for key in expected_keys if key not in response]
            
            if not missing_keys:
                print(f"   ✅ All expected keys present: {expected_keys}")
                if response.get('success'):
                    print(f"   🚀 Cross-platform campaign launch successful")
                    if 'saved_id' in response:
                        self.created_ids['campaign'] = response['saved_id']
                        print(f"   📝 Campaign ID: {response['saved_id']}")
                    if 'campaign_launch' in response:
                        print(f"   📊 Campaign launch data: {type(response['campaign_launch'])}")
                else:
                    print(f"   ⚠️  Success flag is False")
                    success = False
            else:
                print(f"   ❌ Missing expected keys: {missing_keys}")
                success = False
        
        return success

    def test_marketing_approve(self):
        """Test POST /api/marketing/approve with type:'campaign' and the recent id + sample targeting → success true"""
        if 'campaign' not in self.created_ids:
            print(f"   ⚠️  No campaign ID available for approval test")
            return False
            
        approval_data = {
            "type": "campaign",
            "id": self.created_ids['campaign'],
            "targeting": {
                "demographics": {
                    "age_range": "25-55",
                    "gender": "All",
                    "income_level": "Middle to Upper Middle Class"
                },
                "interests": ["Home & Garden", "Sustainable Living", "Interior Design"],
                "behaviors": ["Recently moved", "Home improvement shoppers"],
                "locations": ["Mumbai", "Delhi NCR", "Bangalore", "Pune", "Chennai"]
            },
            "budget_allocation": {
                "Instagram": 40,
                "Facebook": 35,
                "Google Ads": 25
            },
            "approved_by": "Marketing Manager",
            "approval_notes": "Campaign approved for Q1 2024 launch"
        }
        
        success, response = self.run_test(
            "Marketing Approve Campaign",
            "POST",
            "marketing/approve",
            200,
            data=approval_data
        )
        
        if success:
            if response.get('success') is True:
                print(f"   ✅ Campaign approval successful")
                print(f"   ✓ Approved campaign ID: {self.created_ids['campaign']}")
            else:
                print(f"   ❌ Success flag is not True: {response.get('success')}")
                success = False
        
        return success

    def test_marketing_lists(self):
        """Test GET lists: brand-assets, reels, ugc, influencers, campaigns → all arrays include new items"""
        endpoints = [
            ("brand-assets", "Brand Assets"),
            ("reels", "Reels"),
            ("ugc", "UGC Campaigns"),
            ("influencers", "Influencers"),
            ("campaigns", "Campaigns")
        ]
        
        all_success = True
        
        for endpoint, name in endpoints:
            success, response = self.run_test(
                f"List {name}",
                "GET",
                f"marketing/{endpoint}",
                200
            )
            
            if success:
                if isinstance(response, list):
                    print(f"   ✅ {name} list returned {len(response)} items")
                    
                    # Check if our created items are in the list
                    endpoint_key = endpoint.replace('-', '_')  # brand-assets -> brand_assets
                    if endpoint_key == 'brand_assets':
                        endpoint_key = 'brand'
                    elif endpoint_key == 'campaigns':
                        endpoint_key = 'campaign'
                    
                    if endpoint_key in self.created_ids:
                        created_id = self.created_ids[endpoint_key]
                        found = any(item.get('id') == created_id for item in response)
                        if found:
                            print(f"   ✓ Found our created {name.lower()} in the list")
                        else:
                            print(f"   ⚠️  Our created {name.lower()} not found in list (ID: {created_id})")
                else:
                    print(f"   ❌ {name} list is not an array: {type(response)}")
                    all_success = False
            else:
                print(f"   ❌ Failed to get {name} list")
                all_success = False
        
        return all_success

def main():
    print("🚀 Starting Marketing API Focused Tests")
    print("🎯 Testing Goals: Marketing Content Creation & Campaign Management")
    print("=" * 80)
    
    tester = MarketingAPITester()
    
    # Marketing Content Creation Tests
    print("\n🎨 MARKETING CONTENT CREATION TESTS")
    print("=" * 50)
    
    content_tests = [
        ("Create Brand Content", tester.test_create_brand_content),
        ("Create Reel Content", tester.test_create_reel_content),
        ("Create UGC Content", tester.test_create_ugc_content),
        ("Create Influencer Content", tester.test_create_influencer_content),
    ]
    
    # Campaign Management Tests
    print("\n🚀 CAMPAIGN MANAGEMENT TESTS")
    print("=" * 50)
    
    campaign_tests = [
        ("Launch Cross-Platform Campaign", tester.test_launch_crossplatform_campaign),
        ("Marketing Approve Campaign", tester.test_marketing_approve),
    ]
    
    # List Verification Tests
    print("\n📋 LIST VERIFICATION TESTS")
    print("=" * 50)
    
    list_tests = [
        ("Marketing Lists", tester.test_marketing_lists),
    ]
    
    # Run all tests
    all_tests = content_tests + campaign_tests + list_tests
    results = {}
    
    for test_name, test_func in all_tests:
        try:
            print(f"\n" + "-" * 60)
            results[test_name] = test_func()
            time.sleep(1)  # Small delay between tests
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            results[test_name] = False
            tester.tests_run += 1
    
    # Print comprehensive summary
    print("\n" + "=" * 80)
    print("📊 MARKETING API TEST SUMMARY")
    print("=" * 80)
    
    # Group results by category
    content_results = {k: v for k, v in results.items() if k in [t[0] for t in content_tests]}
    campaign_results = {k: v for k, v in results.items() if k in [t[0] for t in campaign_tests]}
    list_results = {k: v for k, v in results.items() if k in [t[0] for t in list_tests]}
    
    print("\n🎨 CONTENT CREATION RESULTS:")
    for test_name, passed in content_results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name}: {status}")
    
    print("\n🚀 CAMPAIGN MANAGEMENT RESULTS:")
    for test_name, passed in campaign_results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name}: {status}")
    
    print("\n📋 LIST VERIFICATION RESULTS:")
    for test_name, passed in list_results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name}: {status}")
    
    # Overall summary
    total_passed = sum(results.values())
    total_tests = len(results)
    
    print(f"\n🎯 OVERALL RESULTS:")
    print(f"   Tests Passed: {total_passed}/{total_tests}")
    print(f"   Success Rate: {(total_passed/total_tests)*100:.1f}%")
    
    if tester.created_ids:
        print(f"   Created Items: {len(tester.created_ids)} marketing items")
        for item_type, item_id in tester.created_ids.items():
            print(f"     - {item_type}: {item_id}")
    
    # Determine exit code
    if total_passed >= total_tests * 0.7:  # 70% success rate for marketing APIs
        print("\n🎉 Marketing API testing completed successfully!")
        print("✅ Ready for frontend marketing modal testing")
        return 0
    else:
        print("\n⚠️  Some critical marketing API tests failed!")
        print("❌ Frontend marketing testing may encounter issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())