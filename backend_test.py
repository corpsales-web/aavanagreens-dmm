#!/usr/bin/env python3
"""
DMM Backend AI Endpoints Fallback Test
Tests specific AI endpoints with minimal payloads to verify fallback functionality
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration - Use external URL from frontend/.env
BASE_URL = "https://dmm-deploy.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class AIFallbackTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
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
    
    def test_ai_generate_strategy_fallback(self):
        """Test POST /api/ai/generate-strategy with minimal payload"""
        try:
            # Minimal payload as requested
            strategy_request = {
                "company_name": "TechCorp",
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
                
                # Check for success=true and strategy.strategy_content non-empty string
                if (data.get("success") == True and 
                    "strategy" in data and 
                    isinstance(data["strategy"].get("strategy_content"), str) and 
                    len(data["strategy"]["strategy_content"].strip()) > 0):
                    
                    self.log_test("AI Strategy Generation Fallback", True, 
                                f"Success with strategy content length: {len(data['strategy']['strategy_content'])}")
                    return True
                else:
                    self.log_test("AI Strategy Generation Fallback", False, 
                                "Missing success=true or empty strategy_content", data)
            else:
                self.log_test("AI Strategy Generation Fallback", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("AI Strategy Generation Fallback", False, f"Error: {str(e)}")
        return False
    
    def test_ai_generate_content_fallback(self):
        """Test POST /api/ai/generate-content with specific payload"""
        try:
            # Specific payload as requested
            content_request = {
                "content_type": "reel",
                "brief": "Launch video",
                "target_audience": "youth",
                "platform": "Instagram"
            }
            
            print(f"Testing POST {API_BASE}/ai/generate-content")
            print(f"Payload: {json.dumps(content_request, indent=2)}")
            
            response = self.session.post(
                f"{API_BASE}/ai/generate-content",
                json=content_request,
                timeout=60
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Body: {json.dumps(data, indent=2)}")
                
                # Check for 200 with content.ai_content non-empty string
                if ("content" in data and 
                    isinstance(data["content"].get("ai_content"), str) and 
                    len(data["content"]["ai_content"].strip()) > 0):
                    
                    self.log_test("AI Content Generation Fallback", True, 
                                f"Success with content length: {len(data['content']['ai_content'])}")
                    return True
                else:
                    self.log_test("AI Content Generation Fallback", False, 
                                "Missing or empty ai_content", data)
            else:
                self.log_test("AI Content Generation Fallback", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("AI Content Generation Fallback", False, f"Error: {str(e)}")
        return False
    
    def test_ai_optimize_campaign_fallback(self):
        """Test POST /api/ai/optimize-campaign with minimal payload"""
        try:
            # Minimal payload as requested
            campaign_request = {
                "campaign_name": "Test Campaign",
                "objective": "Brand awareness",
                "target_audience": "General audience",
                "budget": 1000,
                "channels": ["google_ads"],
                "duration_days": 7
            }
            
            print(f"Testing POST {API_BASE}/ai/optimize-campaign")
            print(f"Payload: {json.dumps(campaign_request, indent=2)}")
            
            response = self.session.post(
                f"{API_BASE}/ai/optimize-campaign",
                json=campaign_request,
                timeout=60
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Body: {json.dumps(data, indent=2)}")
                
                # Check for 200 and ai_optimization present
                if ("campaign" in data and 
                    "ai_optimization" in data["campaign"] and
                    data["campaign"]["ai_optimization"] is not None):
                    
                    self.log_test("AI Campaign Optimization Fallback", True, 
                                f"Success with ai_optimization present")
                    return True
                else:
                    self.log_test("AI Campaign Optimization Fallback", False, 
                                "Missing ai_optimization field", data)
            else:
                self.log_test("AI Campaign Optimization Fallback", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("AI Campaign Optimization Fallback", False, f"Error: {str(e)}")
        return False
    
    def test_health_check(self):
        """Test basic health check"""
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    self.log_test("Health Check", True, "Backend is healthy")
                    return True
                else:
                    self.log_test("Health Check", False, "Invalid health response", data)
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
        return False
    
    def test_demo_campaign_seeding(self):
        """Test seeding demo campaign with UTM data as requested"""
        try:
            # Step 1: POST to /api/marketing/save with the specific JSON payload
            demo_campaign_payload = {
                "item_type": "campaign",
                "data": {
                    "campaign_name": "Demo UTM Campaign",
                    "objective": "brand_awareness",
                    "target_audience": "Gardeners 25-45 in India",
                    "budget": 1000,
                    "channels": ["facebook_ads", "instagram_ads"],
                    "duration_days": 7,
                    "budget_splits": {"facebook_ads": 600, "instagram_ads": 400},
                    "targeting": {"country":"India","age_min":25,"age_max":45,"gender":["Male","Female"]},
                    "utm": {
                        "base_url": "https://aavanagreens.in/products/organic-fertilizer",
                        "source": "facebook",
                        "medium": "paid_social",
                        "campaign": "demo_utm_campaign",
                        "term": "gardeners_25_45",
                        "content": "adA_reel_v1"
                    },
                    "tracking_url": "https://aavanagreens.in/products/organic-fertilizer?utm_source=facebook&utm_medium=paid_social&utm_campaign=demo_utm_campaign&utm_term=gardeners_25_45&utm_content=adA_reel_v1",
                    "ai_optimization": "(AI pending — created for demo)"
                }
            }
            
            print(f"Testing POST {API_BASE}/marketing/save")
            print(f"Payload: {json.dumps(demo_campaign_payload, indent=2)}")
            
            response = self.session.post(
                f"{API_BASE}/marketing/save",
                json=demo_campaign_payload,
                timeout=30
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Body: {json.dumps(data, indent=2)}")
                
                # Check for success=true and item with id
                if (data.get("success") == True and 
                    "item" in data and 
                    "id" in data["item"]):
                    
                    created_id = data["item"]["id"]
                    self.log_test("Demo Campaign Creation", True, 
                                f"Campaign created successfully with ID: {created_id}")
                    
                    # Step 2: GET /api/marketing/list?type=campaign to confirm the item exists
                    print(f"\nTesting GET {API_BASE}/marketing/list?type=campaign")
                    
                    list_response = self.session.get(
                        f"{API_BASE}/marketing/list?type=campaign",
                        timeout=30
                    )
                    
                    print(f"List Response Status: {list_response.status_code}")
                    
                    if list_response.status_code == 200:
                        list_data = list_response.json()
                        print(f"List Response Body: {json.dumps(list_data, indent=2)}")
                        
                        # Find the created campaign in the list
                        created_campaign = None
                        for campaign in list_data:
                            if campaign.get("id") == created_id:
                                created_campaign = campaign
                                break
                        
                        if created_campaign:
                            if created_campaign.get("status") == "Pending Approval":
                                self.log_test("Demo Campaign Verification", True, 
                                            f"Campaign found in list with status 'Pending Approval', ID: {created_id}")
                                # Store the ID for summary
                                self.created_campaign_id = created_id
                                return True
                            else:
                                self.log_test("Demo Campaign Verification", False, 
                                            f"Campaign found but status is '{created_campaign.get('status')}', expected 'Pending Approval'")
                        else:
                            self.log_test("Demo Campaign Verification", False, 
                                        f"Campaign with ID {created_id} not found in list")
                    else:
                        self.log_test("Demo Campaign Verification", False, 
                                    f"List request failed with HTTP {list_response.status_code}")
                else:
                    self.log_test("Demo Campaign Creation", False, 
                                "Missing success=true or item.id in response", data)
            else:
                self.log_test("Demo Campaign Creation", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Demo Campaign Seeding", False, f"Error: {str(e)}")
        return False
    
    def run_demo_campaign_test(self):
        """Run the demo campaign seeding test as requested"""
        print("🚀 Starting DMM Backend Demo Campaign Seeding Test")
        print("=" * 60)
        print(f"Testing against: {BASE_URL}")
        print("=" * 60)
        
        # Health check first
        if not self.test_health_check():
            print("❌ Health check failed - backend may be down")
            return False
        
        print("\n📋 Testing Demo Campaign Seeding...")
        
        # Test demo campaign seeding
        test_result = self.test_demo_campaign_seeding()
        
        # Summary
        self.print_summary()
        
        return test_result
    
    def run_fallback_tests(self):
        """Run the specific fallback tests requested"""
        print("🚀 Starting DMM Backend AI Fallback Tests")
        print("=" * 60)
        print(f"Testing against: {BASE_URL}")
        print("=" * 60)
        
        # Health check first
        if not self.test_health_check():
            print("❌ Health check failed - backend may be down")
            return False
        
        print("\n📋 Testing AI Endpoints Fallback...")
        
        # Test the three specific endpoints
        test1 = self.test_ai_generate_strategy_fallback()
        print()
        test2 = self.test_ai_generate_content_fallback()
        print()
        test3 = self.test_ai_optimize_campaign_fallback()
        
        # Summary
        self.print_summary()
        
        return test1 and test2 and test3
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 AI FALLBACK TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%" if total > 0 else "No tests run")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        else:
            print("\n✅ All tests passed!")

def main():
    """Main test execution"""
    tester = AIFallbackTester()
    
    # Initialize created_campaign_id attribute
    tester.created_campaign_id = None
    
    # Run demo campaign seeding test
    success = tester.run_demo_campaign_test()
    
    if success:
        print(f"\n✅ Demo campaign seeding test passed!")
        if hasattr(tester, 'created_campaign_id') and tester.created_campaign_id:
            print(f"Created campaign ID: {tester.created_campaign_id}")
        return True
    else:
        print("\n❌ Demo campaign seeding test failed!")
        return False

if __name__ == "__main__":
    main()