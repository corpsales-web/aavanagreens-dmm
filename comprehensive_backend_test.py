#!/usr/bin/env python3
"""
Comprehensive Backend Test for Directory Rename Verification
Tests all backend FastAPI endpoints after dmm-frontend→frontend and dmm-backend→backend rename
"""

import requests
import json
import time
from typing import Dict, Any, Optional

# Configuration - Test locally first, then external URL
# BASE_URL = "https://campaign-manager-28.preview.emergentagent.com"  # External URL
BASE_URL = "http://localhost:8001"  # Local backend for testing
API_BASE = f"{BASE_URL}/api"

class ComprehensiveBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.created_campaign_id = None
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": time.time()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    def test_health_check(self):
        """Test 1: Health check - GET /api/health should return {status:"ok"}"""
        try:
            print(f"Testing GET {API_BASE}/health")
            response = self.session.get(f"{API_BASE}/health", timeout=30)
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Body: {json.dumps(data, indent=2)}")
                
                if data.get("status") == "ok":
                    self.log_test("Health Check", True, "Backend is healthy with status='ok'")
                    return True
                else:
                    self.log_test("Health Check", False, f"Expected status='ok', got '{data.get('status')}'", data)
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
        return False
    
    def test_strategy_generation_fallback(self):
        """Test 2: Strategy generation fallback - POST /api/ai/generate-strategy with minimal payload"""
        try:
            # Minimal payload as requested
            strategy_request = {
                "company_name": "TestCorp",
                "industry": "Technology", 
                "target_audience": "Small businesses"
            }
            
            print(f"Testing POST {API_BASE}/ai/generate-strategy")
            print(f"Payload: {json.dumps(strategy_request, indent=2)}")
            
            response = self.session.post(
                f"{API_BASE}/ai/generate-strategy",
                json=strategy_request,
                timeout=60
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Body: {json.dumps(data, indent=2)}")
                
                # Check for success=true and strategy persisted
                if (data.get("success") == True and 
                    "strategy" in data and 
                    "id" in data["strategy"] and
                    isinstance(data["strategy"].get("strategy_content"), str) and 
                    len(data["strategy"]["strategy_content"].strip()) > 0):
                    
                    strategy_id = data["strategy"]["id"]
                    self.log_test("Strategy Generation Fallback", True, 
                                f"Success with strategy ID: {strategy_id}, content length: {len(data['strategy']['strategy_content'])}")
                    return strategy_id
                else:
                    self.log_test("Strategy Generation Fallback", False, 
                                "Missing success=true or invalid strategy data", data)
            else:
                self.log_test("Strategy Generation Fallback", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Strategy Generation Fallback", False, f"Error: {str(e)}")
        return None
    
    def test_strategy_list(self, expected_strategy_id: Optional[str] = None):
        """Verify strategy was persisted in DB - GET /api/ai/strategies returns list"""
        try:
            print(f"Testing GET {API_BASE}/ai/strategies")
            
            response = self.session.get(f"{API_BASE}/ai/strategies", timeout=30)
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Body: {json.dumps(data, indent=2)}")
                
                if isinstance(data, list):
                    if expected_strategy_id:
                        # Look for the specific strategy we created
                        found_strategy = None
                        for strategy in data:
                            if strategy.get("id") == expected_strategy_id:
                                found_strategy = strategy
                                break
                        
                        if found_strategy:
                            self.log_test("Strategy List Verification", True, 
                                        f"Strategy {expected_strategy_id} found in list with {len(data)} total strategies")
                            return True
                        else:
                            self.log_test("Strategy List Verification", False, 
                                        f"Strategy {expected_strategy_id} not found in list of {len(data)} strategies")
                    else:
                        self.log_test("Strategy List", True, f"Retrieved {len(data)} strategies from database")
                        return True
                else:
                    self.log_test("Strategy List", False, "Response is not a list", data)
            else:
                self.log_test("Strategy List", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Strategy List", False, f"Error: {str(e)}")
        return False
    
    def test_campaign_manual_save(self):
        """Test 3: Campaign manual save - POST /api/marketing/save with campaign payload including UTM fields"""
        try:
            # Campaign payload with targeting and UTM fields as requested
            campaign_payload = {
                "item_type": "campaign",
                "data": {
                    "campaign_name": "Test UTM Campaign",
                    "objective": "brand_awareness",
                    "target_audience": "Young professionals 25-35",
                    "budget": 1500,
                    "channels": ["facebook_ads", "google_ads"],
                    "duration_days": 14,
                    "targeting": {
                        "country": "United States",
                        "age_min": 25,
                        "age_max": 35,
                        "gender": ["Male", "Female"],
                        "interests": ["technology", "business"],
                        "devices": ["Mobile", "Desktop"]
                    },
                    "base_url": "https://example.com/landing",
                    "utm_source": "facebook",
                    "utm_medium": "paid_social", 
                    "utm_campaign": "test_campaign_2025",
                    "utm_term": "young_professionals",
                    "utm_content": "video_ad_v1",
                    "tracking_url": "https://example.com/landing?utm_source=facebook&utm_medium=paid_social&utm_campaign=test_campaign_2025&utm_term=young_professionals&utm_content=video_ad_v1"
                }
            }
            
            print(f"Testing POST {API_BASE}/marketing/save")
            print(f"Payload: {json.dumps(campaign_payload, indent=2)}")
            
            response = self.session.post(
                f"{API_BASE}/marketing/save",
                json=campaign_payload,
                timeout=30
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Body: {json.dumps(data, indent=2)}")
                
                # Check for success=true and item with id, and UTM fields stored
                if (data.get("success") == True and 
                    "item" in data and 
                    "id" in data["item"]):
                    
                    item = data["item"]
                    campaign_id = item["id"]
                    
                    # Verify UTM fields are stored
                    utm_fields_present = all(field in item for field in [
                        "base_url", "utm_source", "utm_medium", "utm_campaign", 
                        "utm_term", "utm_content", "tracking_url"
                    ])
                    
                    if utm_fields_present:
                        self.created_campaign_id = campaign_id
                        self.log_test("Campaign Manual Save", True, 
                                    f"Campaign created with ID: {campaign_id}, all UTM fields stored")
                        return campaign_id
                    else:
                        self.log_test("Campaign Manual Save", False, 
                                    f"Campaign created but UTM fields missing: {list(item.keys())}")
                else:
                    self.log_test("Campaign Manual Save", False, 
                                "Missing success=true or item.id in response", data)
            else:
                self.log_test("Campaign Manual Save", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Campaign Manual Save", False, f"Error: {str(e)}")
        return None
    
    def test_list_campaigns(self, expected_campaign_id: Optional[str] = None):
        """Test 4: List campaigns - GET /api/marketing/list?type=campaign should include newly saved item with status 'Pending Approval'"""
        try:
            print(f"Testing GET {API_BASE}/marketing/list?type=campaign")
            
            response = self.session.get(
                f"{API_BASE}/marketing/list?type=campaign",
                timeout=30
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Body: {json.dumps(data, indent=2)}")
                
                if isinstance(data, list):
                    if expected_campaign_id:
                        # Look for the specific campaign we created
                        found_campaign = None
                        for campaign in data:
                            if campaign.get("id") == expected_campaign_id:
                                found_campaign = campaign
                                break
                        
                        if found_campaign:
                            if found_campaign.get("status") == "Pending Approval":
                                self.log_test("List Campaigns", True, 
                                            f"Campaign {expected_campaign_id} found with status 'Pending Approval'")
                                return True
                            else:
                                self.log_test("List Campaigns", False, 
                                            f"Campaign found but status is '{found_campaign.get('status')}', expected 'Pending Approval'")
                        else:
                            self.log_test("List Campaigns", False, 
                                        f"Campaign {expected_campaign_id} not found in list of {len(data)} campaigns")
                    else:
                        self.log_test("List Campaigns", True, f"Retrieved {len(data)} campaigns from database")
                        return True
                else:
                    self.log_test("List Campaigns", False, "Response is not a list", data)
            else:
                self.log_test("List Campaigns", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("List Campaigns", False, f"Error: {str(e)}")
        return False
    
    def test_approve_campaign(self, campaign_id: str):
        """Test 5: Approve - POST /api/marketing/approve should update status to 'Approved' and create approval log"""
        try:
            approve_payload = {
                "item_type": "campaign",
                "item_id": campaign_id,
                "status": "Approved",
                "approved_by": "test_user"
            }
            
            print(f"Testing POST {API_BASE}/marketing/approve")
            print(f"Payload: {json.dumps(approve_payload, indent=2)}")
            
            response = self.session.post(
                f"{API_BASE}/marketing/approve",
                json=approve_payload,
                timeout=30
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Body: {json.dumps(data, indent=2)}")
                
                # Check for success=true and item with updated status
                if (data.get("success") == True and 
                    "item" in data and 
                    data["item"].get("status") == "Approved"):
                    
                    self.log_test("Approve Campaign", True, 
                                f"Campaign {campaign_id} successfully approved, status updated to 'Approved'")
                    return True
                else:
                    self.log_test("Approve Campaign", False, 
                                f"Approval failed or status not updated correctly", data)
            else:
                self.log_test("Approve Campaign", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Approve Campaign", False, f"Error: {str(e)}")
        return False
    
    def test_meta_oauth_start(self):
        """Test 6a: Mock Meta OAuth - GET /api/meta/oauth/start should return redirect JSON"""
        try:
            print(f"Testing GET {API_BASE}/meta/oauth/start")
            
            response = self.session.get(f"{API_BASE}/meta/oauth/start", timeout=30)
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Body: {json.dumps(data, indent=2)}")
                
                # Check for redirect field in response
                if "redirect" in data and isinstance(data["redirect"], str):
                    self.log_test("Meta OAuth Start", True, 
                                f"OAuth start successful, redirect: {data['redirect']}")
                    return True
                else:
                    self.log_test("Meta OAuth Start", False, 
                                "Missing 'redirect' field in response", data)
            else:
                self.log_test("Meta OAuth Start", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Meta OAuth Start", False, f"Error: {str(e)}")
        return False
    
    def test_meta_posts_publish(self):
        """Test 6b: Mock Meta Publish - POST /api/meta/posts/publish with message should return success true"""
        try:
            publish_payload = {
                "message": "Test post from backend API testing",
                "page_id": "test_page_123"
            }
            
            print(f"Testing POST {API_BASE}/meta/posts/publish")
            print(f"Payload: {json.dumps(publish_payload, indent=2)}")
            
            response = self.session.post(
                f"{API_BASE}/meta/posts/publish",
                json=publish_payload,
                timeout=30
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Body: {json.dumps(data, indent=2)}")
                
                # Check for success=true
                if data.get("success") == True:
                    self.log_test("Meta Posts Publish", True, 
                                f"Post publish successful, mock post ID: {data.get('id', 'N/A')}")
                    return True
                else:
                    self.log_test("Meta Posts Publish", False, 
                                "success field is not true", data)
            else:
                self.log_test("Meta Posts Publish", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Meta Posts Publish", False, f"Error: {str(e)}")
        return False
    
    def run_comprehensive_tests(self):
        """Run all comprehensive backend tests as requested"""
        print("🚀 Starting Comprehensive Backend Tests After Directory Rename")
        print("=" * 80)
        print(f"Testing against: {BASE_URL}")
        print("All routes must be prefixed with /api")
        print("=" * 80)
        
        # Test 1: Health check
        print("\n1️⃣ Testing Health Check...")
        if not self.test_health_check():
            print("❌ Health check failed - backend may be down")
            return False
        
        # Test 2: Strategy generation fallback
        print("\n2️⃣ Testing Strategy Generation Fallback...")
        strategy_id = self.test_strategy_generation_fallback()
        
        # Test 2b: Verify strategy persisted in DB
        if strategy_id:
            print("\n2️⃣b Verifying Strategy Persisted in DB...")
            self.test_strategy_list(strategy_id)
        
        # Test 3: Campaign manual save
        print("\n3️⃣ Testing Campaign Manual Save...")
        campaign_id = self.test_campaign_manual_save()
        
        # Test 4: List campaigns
        print("\n4️⃣ Testing List Campaigns...")
        if campaign_id:
            self.test_list_campaigns(campaign_id)
        else:
            self.test_list_campaigns()
        
        # Test 5: Approve campaign
        if campaign_id:
            print("\n5️⃣ Testing Approve Campaign...")
            self.test_approve_campaign(campaign_id)
        
        # Test 6a: Mock Meta OAuth start
        print("\n6️⃣a Testing Mock Meta OAuth Start...")
        self.test_meta_oauth_start()
        
        # Test 6b: Mock Meta posts publish
        print("\n6️⃣b Testing Mock Meta Posts Publish...")
        self.test_meta_posts_publish()
        
        # Summary
        self.print_summary()
        
        # Check if all critical tests passed
        critical_tests = [
            "Health Check",
            "Strategy Generation Fallback", 
            "Campaign Manual Save",
            "List Campaigns",
            "Meta OAuth Start",
            "Meta Posts Publish"
        ]
        
        passed_critical = 0
        for result in self.test_results:
            if result["test"] in critical_tests and result["success"]:
                passed_critical += 1
        
        success_rate = (passed_critical / len(critical_tests)) * 100
        return success_rate >= 85  # 85% success rate for critical tests
    
    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE BACKEND TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%" if total > 0 else "No tests run")
        
        # Show test results by category
        print(f"\n📋 TEST RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {result['test']}: {result['details']}")
        
        # Show failed tests with details
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print(f"\n❌ FAILED TESTS DETAILS:")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['details']}")
                if test.get('response_data'):
                    print(f"    Response: {json.dumps(test['response_data'], indent=4)}")
        else:
            print(f"\n✅ All tests passed!")
        
        # Show created resources
        if self.created_campaign_id:
            print(f"\n📝 CREATED RESOURCES:")
            print(f"  • Campaign ID: {self.created_campaign_id}")

def main():
    """Main test execution"""
    tester = ComprehensiveBackendTester()
    
    # Run comprehensive tests
    success = tester.run_comprehensive_tests()
    
    if success:
        print(f"\n✅ Comprehensive backend tests completed successfully!")
        return True
    else:
        print(f"\n❌ Some critical backend tests failed!")
        return False

if __name__ == "__main__":
    main()