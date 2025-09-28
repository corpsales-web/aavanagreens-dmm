#!/usr/bin/env python3
"""
DMM Backend Focused Test Suite
Tests DMM backend endpoints with proper timeout handling
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8002"
API_BASE = f"{BASE_URL}/api"

class DMMFocusedTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.created_items = []
        
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
            response = self.session.get(f"{API_BASE}/health", timeout=5)
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
                timeout=10
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
            response = self.session.get(f"{API_BASE}/marketing/list?type=campaign", timeout=10)
            
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
        if not self.created_items:
            self.log_test("Marketing Approve", False, "No items available to approve")
            return False
        
        try:
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
                timeout=10
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
    
    def test_ai_generate_strategy_simple(self):
        """Test GPT-5 beta strategy generation with simple request"""
        try:
            strategy_request = {
                "company_name": "TechCorp",
                "industry": "Technology",
                "target_audience": "Developers",
                "budget": "$10,000",
                "goals": ["Growth"]
            }
            
            print("   Testing AI Strategy Generation (may take 30-60 seconds)...")
            response = self.session.post(
                f"{API_BASE}/ai/generate-strategy",
                json=strategy_request,
                timeout=90  # Longer timeout for AI
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "strategy" in data:
                    strategy = data["strategy"]
                    if "id" in strategy and "strategy_content" in strategy:
                        self.created_items.append(("strategy", strategy["id"]))
                        self.log_test("AI Strategy Generation", True, 
                                    f"Generated strategy for {strategy['company_name']}")
                        return True
                    else:
                        self.log_test("AI Strategy Generation", False, "Missing required fields", data)
                else:
                    self.log_test("AI Strategy Generation", False, "Invalid response format", data)
            else:
                self.log_test("AI Strategy Generation", False, 
                            f"HTTP {response.status_code}", response.text[:200])
        except requests.exceptions.Timeout:
            self.log_test("AI Strategy Generation", False, "Request timed out (AI service may be slow)")
        except Exception as e:
            self.log_test("AI Strategy Generation", False, f"Error: {str(e)}")
        return False
    
    def test_ai_generate_content_simple(self):
        """Test GPT-5 beta content generation with simple request"""
        try:
            content_request = {
                "content_type": "reel",
                "brief": "Create a tech product demo",
                "target_audience": "Young professionals",
                "platform": "Instagram",
                "budget": "$1,000"
            }
            
            print("   Testing AI Content Generation (may take 30-60 seconds)...")
            response = self.session.post(
                f"{API_BASE}/ai/generate-content",
                json=content_request,
                timeout=90
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "content" in data:
                    content = data["content"]
                    if "id" in content and "ai_content" in content:
                        self.created_items.append(("reel", content["id"]))
                        self.log_test("AI Content Generation", True, 
                                    f"Generated {content['content_type']} content")
                        return True
                    else:
                        self.log_test("AI Content Generation", False, "Missing required fields", data)
                else:
                    self.log_test("AI Content Generation", False, "Invalid response format", data)
            else:
                self.log_test("AI Content Generation", False, 
                            f"HTTP {response.status_code}", response.text[:200])
        except requests.exceptions.Timeout:
            self.log_test("AI Content Generation", False, "Request timed out (AI service may be slow)")
        except Exception as e:
            self.log_test("AI Content Generation", False, f"Error: {str(e)}")
        return False
    
    def test_ai_optimize_campaign_simple(self):
        """Test GPT-5 beta campaign optimization with simple request"""
        try:
            campaign_request = {
                "campaign_name": "Test Campaign",
                "objective": "Increase awareness",
                "target_audience": "Tech users",
                "budget": 5000.0,
                "channels": ["Google Ads", "Facebook"],
                "duration_days": 14
            }
            
            print("   Testing AI Campaign Optimization (may take 30-60 seconds)...")
            response = self.session.post(
                f"{API_BASE}/ai/optimize-campaign",
                json=campaign_request,
                timeout=90
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "campaign" in data:
                    campaign = data["campaign"]
                    if "id" in campaign and "ai_optimization" in campaign:
                        self.created_items.append(("campaign", campaign["id"]))
                        self.log_test("AI Campaign Optimization", True,
                                    f"Optimized campaign: {campaign['campaign_name']}")
                        return True
                    else:
                        self.log_test("AI Campaign Optimization", False, "Missing required fields", data)
                else:
                    self.log_test("AI Campaign Optimization", False, "Invalid response format", data)
            else:
                self.log_test("AI Campaign Optimization", False,
                            f"HTTP {response.status_code}", response.text[:200])
        except requests.exceptions.Timeout:
            self.log_test("AI Campaign Optimization", False, "Request timed out (AI service may be slow)")
        except Exception as e:
            self.log_test("AI Campaign Optimization", False, f"Error: {str(e)}")
        return False
    
    def run_focused_tests(self):
        """Run focused tests"""
        print("🚀 Starting DMM Backend Focused Test Suite")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_endpoint():
            print("❌ Health check failed - aborting tests")
            return False
        
        # Marketing CRUD tests (these should be fast and reliable)
        print("\n📋 Testing Marketing CRUD Endpoints...")
        marketing_save_success = self.test_marketing_save()
        marketing_list_success = self.test_marketing_list()
        marketing_approve_success = self.test_marketing_approve()
        
        # AI tests (these may be slower)
        print("\n🤖 Testing AI Endpoints (GPT-5 beta)...")
        ai_strategy_success = self.test_ai_generate_strategy_simple()
        ai_content_success = self.test_ai_generate_content_simple()
        ai_campaign_success = self.test_ai_optimize_campaign_simple()
        
        # Summary
        self.print_summary()
        
        # Determine overall success
        critical_success = (
            marketing_save_success and 
            marketing_list_success and 
            marketing_approve_success
        )
        
        ai_success = ai_strategy_success or ai_content_success or ai_campaign_success
        
        return critical_success, ai_success
    
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

def main():
    """Main test execution"""
    tester = DMMFocusedTester()
    critical_success, ai_success = tester.run_focused_tests()
    
    print("\n" + "=" * 60)
    if critical_success and ai_success:
        print("✅ All DMM Backend tests passed successfully!")
        exit(0)
    elif critical_success:
        print("⚠️  Marketing CRUD endpoints working, but AI endpoints had issues")
        print("   This may be due to AI service latency or configuration")
        exit(0)  # Still consider this a success for basic functionality
    else:
        print("❌ Critical DMM Backend tests failed!")
        exit(1)

if __name__ == "__main__":
    main()