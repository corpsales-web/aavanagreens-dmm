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
    
    def test_sso_consume_valid_token(self):
        """Test POST /api/auth/sso/consume with valid HS256 JWT"""
        try:
            # Generate valid JWT payload
            payload = {
                "sub": "user123",
                "email": "test@example.com", 
                "name": "Test User",
                "roles": ["user", "admin"]
            }
            
            token = self.generate_jwt_token(payload)
            
            response = self.session.post(
                f"{API_BASE}/auth/sso/consume",
                json={"token": token},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok") and "user" in data:
                    user = data["user"]
                    # Verify user fields are echoed back
                    expected_fields = ["sub", "email", "name", "roles"]
                    if all(field in user for field in expected_fields):
                        if (user["sub"] == payload["sub"] and 
                            user["email"] == payload["email"] and
                            user["name"] == payload["name"] and
                            user["roles"] == payload["roles"]):
                            self.log_test("SSO Consume (Valid Token)", True, "Token validated and user fields echoed")
                            return True
                        else:
                            self.log_test("SSO Consume (Valid Token)", False, "User fields don't match payload", data)
                    else:
                        self.log_test("SSO Consume (Valid Token)", False, "Missing user fields", data)
                else:
                    self.log_test("SSO Consume (Valid Token)", False, "Invalid response format", data)
            else:
                self.log_test("SSO Consume (Valid Token)", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("SSO Consume (Valid Token)", False, f"Error: {str(e)}")
        return False
    
    def test_sso_consume_invalid_token(self):
        """Test POST /api/auth/sso/consume with invalid token - expect 401"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/sso/consume",
                json={"token": "invalid.jwt.token"},
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test("SSO Consume (Invalid Token)", True, "Correctly rejected invalid token with 401")
                return True
            else:
                self.log_test("SSO Consume (Invalid Token)", False, 
                            f"Expected 401 but got {response.status_code}", response.text)
        except Exception as e:
            self.log_test("SSO Consume (Invalid Token)", False, f"Error: {str(e)}")
        return False
    
    def test_marketing_save_campaign(self):
        """Test POST /api/marketing/save with campaign data"""
        try:
            save_request = {
                "item_type": "campaign",
                "data": {
                    "name": "Test Marketing Campaign",
                    "description": "A comprehensive test campaign",
                    "budget": 15000,
                    "channels": ["email", "social", "search"]
                },
                "default_filters": {
                    "geo": "US",
                    "language": ["en", "es"],
                    "device": ["mobile", "desktop"],
                    "time": "peak_hours",
                    "behavior": ["engaged_users", "lookalike"]
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
                    # Verify required fields
                    required_fields = ["id", "status", "created_at", "updated_at"]
                    missing_fields = [field for field in required_fields if field not in item]
                    
                    if not missing_fields:
                        # Verify UUID format for id
                        try:
                            uuid.UUID(item["id"])
                            uuid_valid = True
                        except ValueError:
                            uuid_valid = False
                        
                        # Verify default status
                        status_correct = item.get("status") == "Pending Approval"
                        
                        # Verify ISO timestamps
                        try:
                            datetime.fromisoformat(item["created_at"].replace('Z', '+00:00'))
                            datetime.fromisoformat(item["updated_at"].replace('Z', '+00:00'))
                            timestamps_valid = True
                        except ValueError:
                            timestamps_valid = False
                        
                        if uuid_valid and status_correct and timestamps_valid:
                            self.created_items.append(("campaign", item["id"]))
                            self.log_test("Marketing Save (Campaign)", True, 
                                        f"Saved campaign with ID: {item['id']}")
                            return True
                        else:
                            issues = []
                            if not uuid_valid: issues.append("invalid UUID")
                            if not status_correct: issues.append("wrong status")
                            if not timestamps_valid: issues.append("invalid timestamps")
                            self.log_test("Marketing Save (Campaign)", False, 
                                        f"Validation issues: {', '.join(issues)}", data)
                    else:
                        self.log_test("Marketing Save (Campaign)", False, 
                                    f"Missing fields: {missing_fields}", data)
                else:
                    self.log_test("Marketing Save (Campaign)", False, "Invalid response format", data)
            else:
                self.log_test("Marketing Save (Campaign)", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Marketing Save (Campaign)", False, f"Error: {str(e)}")
        return False
    
    def test_marketing_save_with_default_status(self):
        """Test POST /api/marketing/save without status - should default to 'Pending Approval'"""
        try:
            save_request = {
                "item_type": "campaign",
                "data": {
                    "name": "Default Status Test Campaign"
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
                    if item.get("status") == "Pending Approval":
                        self.created_items.append(("campaign", item["id"]))
                        self.log_test("Marketing Save (Default Status)", True, 
                                    "Status correctly defaults to 'Pending Approval'")
                        return True
                    else:
                        self.log_test("Marketing Save (Default Status)", False, 
                                    f"Status is '{item.get('status')}', expected 'Pending Approval'", data)
                else:
                    self.log_test("Marketing Save (Default Status)", False, "Invalid response format", data)
            else:
                self.log_test("Marketing Save (Default Status)", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Marketing Save (Default Status)", False, f"Error: {str(e)}")
        return False
    
    def test_marketing_save_invalid_type(self):
        """Test POST /api/marketing/save with invalid item_type - expect 400"""
        try:
            save_request = {
                "item_type": "invalid_type",
                "data": {"name": "Test"}
            }
            
            response = self.session.post(
                f"{API_BASE}/marketing/save",
                json=save_request,
                timeout=30
            )
            
            if response.status_code == 400:
                self.log_test("Marketing Save (Invalid Type)", True, 
                            "Correctly rejected invalid item_type with 400")
                return True
            else:
                self.log_test("Marketing Save (Invalid Type)", False, 
                            f"Expected 400 but got {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Marketing Save (Invalid Type)", False, f"Error: {str(e)}")
        return False
    
    def test_marketing_list_campaigns(self):
        """Test GET /api/marketing/list with type=campaign"""
        try:
            response = self.session.get(f"{API_BASE}/marketing/list?type=campaign", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Verify items don't include _id field
                    has_mongo_id = any("_id" in item for item in data if isinstance(item, dict))
                    if not has_mongo_id:
                        self.log_test("Marketing List (Campaigns)", True, 
                                    f"Retrieved {len(data)} campaigns without _id fields")
                        return True
                    else:
                        self.log_test("Marketing List (Campaigns)", False, 
                                    "Response contains _id fields", data[:2])  # Show first 2 items
                else:
                    self.log_test("Marketing List (Campaigns)", False, "Response is not a list", data)
            else:
                self.log_test("Marketing List (Campaigns)", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Marketing List (Campaigns)", False, f"Error: {str(e)}")
        return False
    
    def test_marketing_list_with_status(self):
        """Test GET /api/marketing/list with status filter"""
        try:
            response = self.session.get(
                f"{API_BASE}/marketing/list?type=campaign&status=Pending Approval", 
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Verify all items have the requested status
                    wrong_status = [item for item in data 
                                  if isinstance(item, dict) and item.get("status") != "Pending Approval"]
                    if not wrong_status:
                        self.log_test("Marketing List (With Status)", True, 
                                    f"Retrieved {len(data)} campaigns with correct status filter")
                        return True
                    else:
                        self.log_test("Marketing List (With Status)", False, 
                                    f"Found {len(wrong_status)} items with wrong status", wrong_status[:2])
                else:
                    self.log_test("Marketing List (With Status)", False, "Response is not a list", data)
            else:
                self.log_test("Marketing List (With Status)", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Marketing List (With Status)", False, f"Error: {str(e)}")
        return False
    
    def test_marketing_approve_success(self):
        """Test POST /api/marketing/approve with valid item"""
        # Need an item to approve
        if not self.created_items:
            self.log_test("Marketing Approve (Success)", False, "No items available to approve")
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
                    "device": ["mobile"],
                    "time": "business_hours",
                    "behavior": ["high_intent"]
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
                    # Verify status updated and filters applied
                    if (item.get("status") == "Approved" and 
                        "approval_filters" in item and
                        "updated_at" in item):
                        self.log_test("Marketing Approve (Success)", True, 
                                    f"Successfully approved {item_type} with ID: {item_id}")
                        return True
                    else:
                        self.log_test("Marketing Approve (Success)", False, 
                                    "Item not properly updated", data)
                else:
                    self.log_test("Marketing Approve (Success)", False, "Invalid response format", data)
            else:
                self.log_test("Marketing Approve (Success)", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Marketing Approve (Success)", False, f"Error: {str(e)}")
        return False
    
    def test_marketing_approve_not_found(self):
        """Test POST /api/marketing/approve with unknown item - expect 404"""
        try:
            approve_request = {
                "item_type": "campaign",
                "item_id": str(uuid.uuid4()),  # Random UUID that doesn't exist
                "status": "Approved",
                "approved_by": "test_system"
            }
            
            response = self.session.post(
                f"{API_BASE}/marketing/approve",
                json=approve_request,
                timeout=30
            )
            
            if response.status_code == 404:
                self.log_test("Marketing Approve (Not Found)", True, 
                            "Correctly returned 404 for unknown item")
                return True
            else:
                self.log_test("Marketing Approve (Not Found)", False, 
                            f"Expected 404 but got {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Marketing Approve (Not Found)", False, f"Error: {str(e)}")
        return False
    
    def run_all_tests(self):
        """Run all non-AI tests in sequence"""
        print("🚀 Starting DMM Backend Non-AI Test Suite")
        print("=" * 60)
        print("⚠️  Skipping /api/ai/* endpoints due to budget hold")
        print("=" * 60)
        
        # Test 1: Health endpoint
        print("\n1️⃣ Testing Health Endpoint...")
        if not self.test_health_endpoint():
            print("❌ Health check failed - aborting tests")
            return False
        
        # Test 2: SSO endpoints
        print("\n2️⃣ Testing SSO Authentication...")
        self.test_sso_consume_valid_token()
        self.test_sso_consume_invalid_token()
        
        # Test 3: Marketing save endpoints
        print("\n3️⃣ Testing Marketing Save...")
        self.test_marketing_save_campaign()
        self.test_marketing_save_with_default_status()
        self.test_marketing_save_invalid_type()
        
        # Test 4: Marketing list endpoints
        print("\n4️⃣ Testing Marketing List...")
        self.test_marketing_list_campaigns()
        self.test_marketing_list_with_status()
        
        # Test 5: Marketing approve endpoints
        print("\n5️⃣ Testing Marketing Approve...")
        self.test_marketing_approve_success()
        self.test_marketing_approve_not_found()
        
        # Summary
        self.print_summary()
        
        return self.get_overall_success()
    
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