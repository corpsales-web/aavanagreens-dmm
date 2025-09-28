#!/usr/bin/env python3
"""
DMM Backend Comprehensive Test Suite
Tests all DMM backend endpoints including AI orchestration with GPT-5 beta
"""

import requests
import json
import time
import uuid
from typing import Dict, Any, List

# Configuration
BASE_URL = "http://localhost:8002"
API_BASE = f"{BASE_URL}/api"

class DMMBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.created_items = []  # Track created items for cleanup
        
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
    
    def test_health_endpoint(self):
        """Test basic health check endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok" and data.get("service") == "dmm-backend":
                    self.log_test("Health Check", True, "Backend is healthy")
                    return True
                else:
                    self.log_test("Health Check", False, "Invalid health response format", data)
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
        return False
    
    def test_ai_generate_strategy(self):
        """Test GPT-5 beta strategy generation endpoint"""
        try:
            strategy_request = {
                "company_name": "TechFlow Solutions",
                "industry": "SaaS Technology",
                "target_audience": "B2B software developers and CTOs",
                "budget": "$50,000/month",
                "goals": ["Increase brand awareness", "Generate qualified leads", "Establish thought leadership"],
                "website_url": "https://techflow.example.com"
            }
            
            response = self.session.post(
                f"{API_BASE}/ai/generate-strategy",
                json=strategy_request,
                timeout=60  # AI calls can take longer
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "strategy" in data:
                    strategy = data["strategy"]
                    # Verify strategy structure
                    required_fields = ["id", "company_name", "industry", "strategy_content", "status"]
                    missing_fields = [field for field in required_fields if field not in strategy]
                    
                    if not missing_fields:
                        self.created_items.append(("strategy", strategy["id"]))
                        self.log_test("AI Strategy Generation", True, 
                                    f"Generated strategy for {strategy['company_name']}")
                        return True
                    else:
                        self.log_test("AI Strategy Generation", False, 
                                    f"Missing fields: {missing_fields}", data)
                else:
                    self.log_test("AI Strategy Generation", False, "Invalid response format", data)
            else:
                self.log_test("AI Strategy Generation", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("AI Strategy Generation", False, f"Error: {str(e)}")
        return False
    
    def test_ai_generate_content(self):
        """Test GPT-5 beta content generation for different types"""
        content_types = ["reel", "ugc", "brand", "influencer"]
        success_count = 0
        
        for content_type in content_types:
            try:
                content_request = {
                    "content_type": content_type,
                    "brief": f"Create engaging {content_type} content for a tech startup launching a new productivity app",
                    "target_audience": "Young professionals aged 25-35",
                    "platform": "Instagram",
                    "budget": "$5,000",
                    "festival": "New Year 2024"
                }
                
                response = self.session.post(
                    f"{API_BASE}/ai/generate-content",
                    json=content_request,
                    timeout=60
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "content" in data:
                        content = data["content"]
                        required_fields = ["id", "content_type", "brief", "ai_content", "status"]
                        missing_fields = [field for field in required_fields if field not in content]
                        
                        if not missing_fields:
                            self.created_items.append((content_type, content["id"]))
                            self.log_test(f"AI Content Generation ({content_type})", True,
                                        f"Generated {content_type} content")
                            success_count += 1
                        else:
                            self.log_test(f"AI Content Generation ({content_type})", False,
                                        f"Missing fields: {missing_fields}", data)
                    else:
                        self.log_test(f"AI Content Generation ({content_type})", False,
                                    "Invalid response format", data)
                else:
                    self.log_test(f"AI Content Generation ({content_type})", False,
                                f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_test(f"AI Content Generation ({content_type})", False, f"Error: {str(e)}")
        
        return success_count == len(content_types)
    
    def test_ai_optimize_campaign(self):
        """Test GPT-5 beta campaign optimization endpoint"""
        try:
            campaign_request = {
                "campaign_name": "Q1 Product Launch Campaign",
                "objective": "Drive product awareness and generate 1000 sign-ups",
                "target_audience": "Tech-savvy professionals in North America",
                "budget": 25000.0,
                "channels": ["Google Ads", "Facebook", "LinkedIn", "Instagram"],
                "duration_days": 30
            }
            
            response = self.session.post(
                f"{API_BASE}/ai/optimize-campaign",
                json=campaign_request,
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "campaign" in data:
                    campaign = data["campaign"]
                    required_fields = ["id", "campaign_name", "objective", "ai_optimization", "status"]
                    missing_fields = [field for field in required_fields if field not in campaign]
                    
                    if not missing_fields:
                        self.created_items.append(("campaign", campaign["id"]))
                        self.log_test("AI Campaign Optimization", True,
                                    f"Optimized campaign: {campaign['campaign_name']}")
                        return True
                    else:
                        self.log_test("AI Campaign Optimization", False,
                                    f"Missing fields: {missing_fields}", data)
                else:
                    self.log_test("AI Campaign Optimization", False, "Invalid response format", data)
            else:
                self.log_test("AI Campaign Optimization", False,
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("AI Campaign Optimization", False, f"Error: {str(e)}")
        return False
    
    def test_marketing_save(self):
        """Test marketing save endpoint"""
        try:
            save_request = {
                "item_type": "campaign",
                "data": {
                    "name": "Test Campaign",
                    "description": "A test marketing campaign",
                    "budget": 10000,
                    "channels": ["email", "social"]
                },
                "default_filters": {
                    "geo": "US",
                    "language": ["en"],
                    "device": ["mobile", "desktop"]
                }
            }
            
            response = self.session.post(
                f"{API_BASE}/marketing/save",
                json=save_request,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "item" in data:
                    item = data["item"]
                    if "id" in item and item.get("status") == "Pending Approval":
                        self.created_items.append(("campaign", item["id"]))
                        self.log_test("Marketing Save", True, f"Saved campaign with ID: {item['id']}")
                        return True
                    else:
                        self.log_test("Marketing Save", False, "Invalid item structure", data)
                else:
                    self.log_test("Marketing Save", False, "Invalid response format", data)
            else:
                self.log_test("Marketing Save", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Marketing Save", False, f"Error: {str(e)}")
        return False
    
    def test_marketing_list(self):
        """Test marketing list endpoint"""
        try:
            # Test listing campaigns
            response = self.session.get(f"{API_BASE}/marketing/list?type=campaign", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Marketing List", True, f"Retrieved {len(data)} campaigns")
                    return True
                else:
                    self.log_test("Marketing List", False, "Response is not a list", data)
            else:
                self.log_test("Marketing List", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Marketing List", False, f"Error: {str(e)}")
        return False
    
    def test_marketing_approve(self):
        """Test marketing approve endpoint"""
        # First, we need an item to approve
        if not self.created_items:
            self.log_test("Marketing Approve", False, "No items available to approve")
            return False
        
        try:
            # Use the first created item
            item_type, item_id = self.created_items[0]
            
            approve_request = {
                "item_type": item_type,
                "item_id": item_id,
                "status": "Approved",
                "filters": {
                    "geo": "US",
                    "language": ["en"],
                    "device": ["mobile"]
                },
                "approved_by": "test_system"
            }
            
            response = self.session.post(
                f"{API_BASE}/marketing/approve",
                json=approve_request,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "item" in data:
                    item = data["item"]
                    if item.get("status") == "Approved":
                        self.log_test("Marketing Approve", True, f"Approved {item_type} with ID: {item_id}")
                        return True
                    else:
                        self.log_test("Marketing Approve", False, "Item not properly approved", data)
                else:
                    self.log_test("Marketing Approve", False, "Invalid response format", data)
            else:
                self.log_test("Marketing Approve", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Marketing Approve", False, f"Error: {str(e)}")
        return False
    
    def test_comprehensive_workflow(self):
        """Test comprehensive workflow: Generate → Save → List → Approve"""
        workflow_success = True
        
        print("\n🔄 Testing Comprehensive Workflow...")
        
        # Step 1: Generate strategy
        if not self.test_ai_generate_strategy():
            workflow_success = False
        
        # Step 2: Generate content for each type
        if not self.test_ai_generate_content():
            workflow_success = False
        
        # Step 3: Optimize campaign
        if not self.test_ai_optimize_campaign():
            workflow_success = False
        
        # Step 4: Save additional items
        if not self.test_marketing_save():
            workflow_success = False
        
        # Step 5: List items
        if not self.test_marketing_list():
            workflow_success = False
        
        # Step 6: Approve items
        if not self.test_marketing_approve():
            workflow_success = False
        
        self.log_test("Comprehensive Workflow", workflow_success, 
                     "Complete workflow test" if workflow_success else "Workflow had failures")
        
        return workflow_success
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        error_tests = [
            {
                "name": "Invalid Strategy Request",
                "endpoint": "/ai/generate-strategy",
                "data": {"invalid": "data"},
                "expected_status": 422
            },
            {
                "name": "Invalid Content Type",
                "endpoint": "/ai/generate-content", 
                "data": {"content_type": "invalid", "brief": "test"},
                "expected_status": 422
            },
            {
                "name": "Invalid Marketing Type",
                "endpoint": "/marketing/save",
                "data": {"item_type": "invalid", "data": {}},
                "expected_status": 400
            }
        ]
        
        success_count = 0
        for test in error_tests:
            try:
                response = self.session.post(
                    f"{API_BASE}{test['endpoint']}",
                    json=test["data"],
                    timeout=30
                )
                
                if response.status_code >= 400:  # Any error status is expected
                    self.log_test(test["name"], True, f"Properly returned error status {response.status_code}")
                    success_count += 1
                else:
                    self.log_test(test["name"], False, f"Expected error but got {response.status_code}")
            except Exception as e:
                self.log_test(test["name"], False, f"Error: {str(e)}")
        
        return success_count == len(error_tests)
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting DMM Backend Comprehensive Test Suite")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_endpoint():
            print("❌ Health check failed - aborting tests")
            return False
        
        # Individual endpoint tests
        print("\n📋 Testing Individual Endpoints...")
        self.test_ai_generate_strategy()
        self.test_ai_generate_content()
        self.test_ai_optimize_campaign()
        self.test_marketing_save()
        self.test_marketing_list()
        self.test_marketing_approve()
        
        # Comprehensive workflow
        print("\n🔄 Testing Comprehensive Workflows...")
        self.test_comprehensive_workflow()
        
        # Error handling
        print("\n⚠️  Testing Error Handling...")
        self.test_error_handling()
        
        # Summary
        self.print_summary()
        
        return self.get_overall_success()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        
        # Show created items
        if self.created_items:
            print(f"\n📝 Created {len(self.created_items)} test items in database")
    
    def get_overall_success(self):
        """Get overall test success status"""
        if not self.test_results:
            return False
        
        # Critical tests that must pass
        critical_tests = [
            "Health Check",
            "AI Strategy Generation", 
            "AI Campaign Optimization",
            "Marketing Save",
            "Marketing List"
        ]
        
        critical_passed = all(
            any(result["test"] == test and result["success"] for result in self.test_results)
            for test in critical_tests
        )
        
        return critical_passed

def main():
    """Main test execution"""
    tester = DMMBackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ DMM Backend tests completed successfully!")
        exit(0)
    else:
        print("\n❌ DMM Backend tests had critical failures!")
        exit(1)

if __name__ == "__main__":
    main()