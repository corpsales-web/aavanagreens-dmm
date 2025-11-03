import requests
import sys
import json
from datetime import datetime

class NotificationsWebhookTester:
    def __init__(self, base_url="https://campaign-manager-28.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if params:
            print(f"   Params: {params}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=15)
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
                    print(f"   Response (text): {response.text}")
                    return True, {"text": response.text}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error (text): {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_notifications_public_key(self):
        """Test GET /api/notifications/public-key -> expect 200 with {publicKey}"""
        success, response = self.run_test(
            "Notifications Public Key",
            "GET",
            "notifications/public-key",
            200
        )
        
        if success:
            if isinstance(response, dict) and "publicKey" in response:
                print(f"   ✅ Public key found: {response['publicKey'][:50]}...")
                return True
            else:
                print(f"   ❌ Expected 'publicKey' field in response")
                return False
        
        return success

    def test_notifications_subscribe(self):
        """Test POST /api/notifications/subscribe with subscription data -> expect success true"""
        subscription_data = {
            "id": "test-sub",
            "endpoint": "https://example.com/test",
            "keys": {
                "p256dh": "abc",
                "auth": "xyz"
            }
        }
        
        success, response = self.run_test(
            "Notifications Subscribe",
            "POST",
            "notifications/subscribe",
            200,
            data=subscription_data
        )
        
        if success:
            if isinstance(response, dict) and response.get("success") is True:
                print(f"   ✅ Subscription successful")
                return True
            else:
                print(f"   ❌ Expected 'success: true' in response")
                return False
        
        return success

    def test_notifications_test(self):
        """Test POST /api/notifications/test with notification data -> expect queued true"""
        notification_data = {
            "title": "Hello",
            "body": "From test",
            "subscription_id": "test-sub"
        }
        
        success, response = self.run_test(
            "Notifications Test",
            "POST",
            "notifications/test",
            200,
            data=notification_data
        )
        
        if success:
            if isinstance(response, dict) and response.get("queued") is True:
                print(f"   ✅ Notification queued successfully")
                return True
            else:
                print(f"   ❌ Expected 'queued: true' in response")
                return False
        
        return success

    def test_whatsapp_webhook_wrong_token(self):
        """Test GET /api/whatsapp/webhook with wrong verify_token -> expect 403"""
        params = {
            "hub.mode": "subscribe",
            "hub.verify_token": "wrong_token",
            "hub.challenge": "123"
        }
        
        success, response = self.run_test(
            "WhatsApp Webhook Wrong Token",
            "GET",
            "whatsapp/webhook",
            403,
            params=params
        )
        
        if success:
            print(f"   ✅ Correctly rejected wrong verify token with 403")
            return True
        
        return success

def main():
    print("🚀 Starting Notifications & WhatsApp Webhook Tests")
    print("🎯 Testing specific endpoints as requested")
    print("=" * 80)
    
    tester = NotificationsWebhookTester()
    
    # Test the specific endpoints mentioned in the review request
    tests = [
        ("Notifications Public Key", tester.test_notifications_public_key),
        ("Notifications Subscribe", tester.test_notifications_subscribe),
        ("Notifications Test", tester.test_notifications_test),
        ("WhatsApp Webhook Wrong Token", tester.test_whatsapp_webhook_wrong_token),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            print(f"\n" + "-" * 60)
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            results[test_name] = False
            tester.tests_run += 1
    
    # Print summary
    print("\n" + "=" * 80)
    print("📊 NOTIFICATIONS & WEBHOOK TEST SUMMARY")
    print("=" * 80)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name}: {status}")
    
    # Overall summary
    total_passed = sum(results.values())
    total_tests = len(results)
    
    print(f"\n🎯 OVERALL RESULTS:")
    print(f"   Tests Passed: {total_passed}/{total_tests}")
    print(f"   Success Rate: {(total_passed/total_tests)*100:.1f}%")
    
    # Expected results based on review request:
    # 1. GET /api/notifications/public-key → expect 200 with {publicKey}
    # 2. POST /api/notifications/subscribe → expect success true
    # 3. POST /api/notifications/test → expect queued true
    # 4. GET /api/whatsapp/webhook with wrong token → expect 403
    
    if total_passed == total_tests:
        print("\n🎉 All notification and webhook tests passed!")
        print("✅ Endpoints working as expected")
        return 0
    else:
        print("\n⚠️  Some notification/webhook tests failed!")
        print("❌ Check endpoint implementations")
        return 1

if __name__ == "__main__":
    sys.exit(main())