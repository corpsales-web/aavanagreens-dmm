#!/usr/bin/env python3
"""
DMM Backend AI Endpoints Fallback Test
Tests specific AI endpoints with minimal payloads to verify fallback functionality
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration - Use production URL from frontend .env
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
        print("📊 NON-AI TEST SUMMARY")
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
        
        print("\n⚠️  AI endpoints (/api/ai/*) were SKIPPED due to budget hold")
    
    def get_overall_success(self):
        """Get overall test success status"""
        if not self.test_results:
            return False
        
        # Critical tests that must pass for non-AI functionality
        critical_tests = [
            "Health Check",
            "SSO Consume (Valid Token)",
            "Marketing Save (Campaign)",
            "Marketing List (Campaigns)",
            "Marketing Approve (Success)"
        ]
        
        critical_passed = all(
            any(result["test"] == test and result["success"] for result in self.test_results)
            for test in critical_tests
        )
        
        return critical_passed

def main():
    """Main test execution"""
    tester = DMMNonAITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ DMM Backend non-AI tests completed successfully!")
        exit(0)
    else:
        print("\n❌ DMM Backend non-AI tests had critical failures!")
        exit(1)

if __name__ == "__main__":
    main()