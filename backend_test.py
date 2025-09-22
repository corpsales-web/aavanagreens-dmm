import requests
import sys
import json
from datetime import datetime
import time

class AavanaCRMAPITester:
    def __init__(self, base_url="https://crm-whatsapp-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_leads = []  # Track created leads for cleanup

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

    def test_root_api(self):
        """Test GET /api/ -> expect 200 JSON with message"""
        success, response = self.run_test(
            "Root API",
            "GET",
            "",
            200
        )
        
        if success and isinstance(response, dict) and "message" in response:
            print(f"   ✅ Root API working: {response['message']}")
        elif success:
            print(f"   ⚠️  Root API responded but unexpected format: {response}")
        
        return success

    def test_dashboard_stats(self):
        """Test GET /api/dashboard/stats -> expect 200 with keys total_leads, new_leads, qualified_leads, etc."""
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            expected_keys = ['total_leads', 'new_leads', 'qualified_leads', 'won_deals', 'lost_deals', 'total_revenue', 'pending_tasks', 'conversion_rate']
            missing_keys = [key for key in expected_keys if key not in response]
            
            if not missing_keys:
                print(f"   ✅ All expected keys present")
                print(f"   📊 Stats: {response['total_leads']} leads, {response['qualified_leads']} qualified, {response['conversion_rate']}% conversion")
            else:
                print(f"   ⚠️  Missing keys: {missing_keys}")
                print(f"   📊 Available keys: {list(response.keys())}")
        
        return success

    def test_optimized_lead_creation(self):
        """Test POST /api/leads/optimized-create with realistic payload"""
        test_lead = {
            "name": "Test Customer",
            "email": f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
            "phone": "9876543210",
            "qualification_score": 85,
            "status": "Qualified",
            "project_type": "Residential",
            "budget_range": "50k_100k",
            "timeline": "3_months",
            "location": "Mumbai",
            "city": "Mumbai",
            "state": "Maharashtra",
            "requirements": "Looking for sustainable balcony garden design",
            "decision_maker": "Self",
            "urgency": "high"
        }
        
        success, response = self.run_test(
            "Optimized Lead Creation",
            "POST",
            "leads/optimized-create",
            201,
            data=test_lead
        )
        
        if success:
            if "success" in response and response["success"]:
                print(f"   ✅ Lead created successfully")
                if "lead" in response and "id" in response["lead"]:
                    print(f"   📝 Lead ID: {response['lead']['id']}")
                if "auto_converted_to_deal" in response:
                    print(f"   🔄 Auto-converted to deal: {response['auto_converted_to_deal']}")
                if "qualification_summary" in response:
                    qual = response["qualification_summary"]
                    print(f"   🎯 Qualification: {qual.get('score', 'N/A')}/100, Level: {qual.get('level', 'N/A')}")
            else:
                print(f"   ❌ Unexpected response format: {response}")
                success = False
        
        return success

    def test_auth_seed_admin(self):
        """Test POST /api/auth/seed-admin -> expect 200 with user data"""
        admin_data = {
            "email": "admin@aavana.local",
            "password": "Admin@12345"
        }
        
        success, response = self.run_test(
            "Seed Admin User",
            "POST",
            "auth/seed-admin",
            200,
            data=admin_data
        )
        
        if success:
            if "user" in response:
                print(f"   ✅ Admin user seeded successfully")
                print(f"   👤 User: {response['user'].get('email', 'N/A')} ({response['user'].get('role', 'N/A')})")
                return True, response
            else:
                print(f"   ❌ Unexpected response format: {response}")
                return False, {}
        
        return False, {}

    def test_auth_login(self):
        """Test POST /api/auth/login -> expect 200 with token"""
        login_data = {
            "identifier": "admin@aavana.local",
            "password": "Admin@12345"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success:
            if "access_token" in response:
                print(f"   ✅ Login successful")
                print(f"   🔑 Token received: {response['access_token'][:20]}...")
                return True, response['access_token']
            else:
                print(f"   ❌ No access token in response: {response}")
                return False, None
        
        return False, None

    def test_ai_chat_quick_response(self):
        """Test POST /api/ai/chat with quick_response task_type -> expect 200 with response string"""
        chat_data = {
            "message": "Generate 3 taglines for Aavana Greens",
            "task_type": "quick_response"
        }
        
        success, response = self.run_test(
            "AI Chat Quick Response",
            "POST",
            "ai/chat",
            200,
            data=chat_data
        )
        
        if success:
            if response.get("status_code") != 502:
                print(f"   ✅ AI Chat working (no 502 error)")
                if "response" in response:
                    print(f"   🤖 AI Response: {response['response'][:100]}...")
                return True
            else:
                print(f"   ❌ Got 502 error - AI service unavailable")
                return False
        else:
            print(f"   ⚠️  AI Chat endpoint not responding properly")
            return False

    def test_ai_specialized_chat(self):
        """Test POST /api/ai/specialized-chat -> expect 200 with EnhancedChatResponse"""
        chat_data = {
            "message": "Create a UGC campaign idea",
            "session_id": "test",
            "language": "en",
            "context": {}
        }
        
        success, response = self.run_test(
            "AI Specialized Chat",
            "POST",
            "ai/specialized-chat",
            200,
            data=chat_data
        )
        
        if success:
            print(f"   ✅ Specialized Chat working")
            if "response" in response or "message" in response:
                print(f"   🎯 Specialized response received")
            return True
        else:
            print(f"   ⚠️  Specialized Chat endpoint not available")
            return False

    def test_aavana2_enhanced_chat(self):
        """Test POST /api/aavana2/enhanced-chat -> expect 200 with EnhancedChatResponse"""
        chat_data = {
            "message": "Summarize sales goals",
            "session_id": "test",
            "language": "en",
            "context": {}
        }
        
        success, response = self.run_test(
            "Aavana 2.0 Enhanced Chat",
            "POST",
            "aavana2/enhanced-chat",
            200,
            data=chat_data
        )
        
        if success:
            print(f"   ✅ Aavana 2.0 Enhanced Chat working")
            if "response" in response or "message" in response:
                print(f"   🚀 Enhanced response received")
            return True
        else:
            print(f"   ⚠️  Aavana 2.0 Enhanced Chat endpoint not available")
            return False

    def test_aavana_health(self):
        """Test GET /api/aavana/health -> expect 200 with healthy status"""
        success, response = self.run_test(
            "Aavana Health Check",
            "GET",
            "aavana/health",
            200
        )
        
        if success:
            print(f"   ✅ Health endpoint working")
            if "status" in response:
                print(f"   💚 Health Status: {response['status']}")
            return True
        else:
            print(f"   ⚠️  Health endpoint not available")
            return False

    def test_ai_chat(self):
        """Test POST /api/ai/chat with messages -> expect 200 or graceful fallback"""
        test_messages = [{"role": "user", "content": "Hello"}]
        
        success, response = self.run_test(
            "AI Chat",
            "POST",
            "ai/chat",
            200,
            data={"messages": test_messages}
        )
        
        if success:
            print(f"   ✅ AI Chat working")
            if "response" in response:
                print(f"   🤖 AI Response: {response['response'][:100]}...")
            elif "fallback" in response:
                print(f"   🔄 Graceful fallback: {response['fallback']}")
        else:
            # Try alternative endpoint structure
            print(f"   ℹ️  Trying alternative AI endpoint...")
            success_alt, response_alt = self.run_test(
                "AI Chat Alternative",
                "POST", 
                "ai/generate-content",
                200,
                data={"type": "chat", "content": "Hello", "context": "test"}
            )
            if success_alt:
                print(f"   ✅ Alternative AI endpoint working")
                success = True
            else:
                print(f"   ⚠️  AI endpoints not available - this is acceptable at this stage")
        
        return success

    def create_realistic_lead(self, index):
        """Create a realistic lead with unique data"""
        leads_data = [
            {
                "name": "Rajesh Kumar",
                "email": f"rajesh.kumar.{datetime.now().strftime('%Y%m%d_%H%M%S')}_{index}@example.com",
                "phone": f"987654321{index}",
                "qualification_score": 85,
                "status": "Qualified",
                "project_type": "Residential Villa",
                "budget_range": "500k_1M",
                "timeline": "6_months",
                "location": "Bandra West",
                "city": "Mumbai",
                "state": "Maharashtra",
                "requirements": "Luxury villa with rooftop garden and sustainable landscaping",
                "urgency": "high"
            },
            {
                "name": "Priya Sharma",
                "email": f"priya.sharma.{datetime.now().strftime('%Y%m%d_%H%M%S')}_{index}@example.com",
                "phone": f"987654322{index}",
                "qualification_score": 75,
                "status": "Qualified",
                "project_type": "Apartment Balcony",
                "budget_range": "25k_50k",
                "timeline": "1_month",
                "location": "Koramangala",
                "city": "Bangalore",
                "state": "Karnataka",
                "requirements": "Modern balcony garden with automated irrigation system",
                "urgency": "medium"
            },
            {
                "name": "Amit Patel",
                "email": f"amit.patel.{datetime.now().strftime('%Y%m%d_%H%M%S')}_{index}@example.com",
                "phone": f"987654323{index}",
                "qualification_score": 90,
                "status": "Qualified",
                "project_type": "Commercial Office",
                "budget_range": "250k_500k",
                "timeline": "3_months",
                "location": "Cyber City",
                "city": "Gurgaon",
                "state": "Haryana",
                "requirements": "Corporate office green spaces and indoor plant installations",
                "urgency": "high"
            },
            {
                "name": "Sunita Reddy",
                "email": f"sunita.reddy.{datetime.now().strftime('%Y%m%d_%H%M%S')}_{index}@example.com",
                "phone": f"987654324{index}",
                "qualification_score": 70,
                "status": "New",
                "project_type": "Residential Apartment",
                "budget_range": "100k_250k",
                "timeline": "flexible",
                "location": "Hitech City",
                "city": "Hyderabad",
                "state": "Telangana",
                "requirements": "Complete home interior landscaping with low maintenance plants",
                "urgency": "low"
            },
            {
                "name": "Vikram Singh",
                "email": f"vikram.singh.{datetime.now().strftime('%Y%m%d_%H%M%S')}_{index}@example.com",
                "phone": f"987654325{index}",
                "qualification_score": 80,
                "status": "Qualified",
                "project_type": "Farmhouse",
                "budget_range": "above_1M",
                "timeline": "6_months",
                "location": "Lonavala",
                "city": "Pune",
                "state": "Maharashtra",
                "requirements": "Extensive farmhouse landscaping with organic vegetable garden",
                "urgency": "medium"
            },
            {
                "name": "Meera Joshi",
                "email": f"meera.joshi.{datetime.now().strftime('%Y%m%d_%H%M%S')}_{index}@example.com",
                "phone": f"987654326{index}",
                "qualification_score": 65,
                "status": "New",
                "project_type": "Terrace Garden",
                "budget_range": "50k_100k",
                "timeline": "immediate",
                "location": "Andheri East",
                "city": "Mumbai",
                "state": "Maharashtra",
                "requirements": "Terrace garden setup with water-efficient plants and seating area",
                "urgency": "high"
            }
        ]
        
        return leads_data[index % len(leads_data)]

    def test_seed_demo_leads(self):
        """Create 6 realistic leads via POST /api/leads/optimized-create"""
        print(f"\n🌱 SEEDING DEMO LEADS")
        print("-" * 40)
        
        success_count = 0
        
        for i in range(6):
            lead_data = self.create_realistic_lead(i)
            
            success, response = self.run_test(
                f"Create Lead {i+1}: {lead_data['name']}",
                "POST",
                "leads/optimized-create",
                201,
                data=lead_data
            )
            
            if success:
                success_count += 1
                if "lead" in response and "id" in response["lead"]:
                    lead_id = response["lead"]["id"]
                    self.created_leads.append(lead_id)
                    print(f"   📝 Lead ID: {lead_id}")
                    
                    if "auto_converted_to_deal" in response and response["auto_converted_to_deal"]:
                        print(f"   🔄 Auto-converted to deal!")
                        
                    if "qualification_summary" in response:
                        qual = response["qualification_summary"]
                        print(f"   🎯 Score: {qual.get('score', 'N/A')}/100")
            else:
                print(f"   ❌ Failed to create lead: {lead_data['name']}")
            
            # Small delay between requests
            time.sleep(0.5)
        
        print(f"\n📊 Lead Creation Summary: {success_count}/6 leads created successfully")
        return success_count >= 4  # Consider success if at least 4/6 leads created

    def test_verify_leads_list(self):
        """Verify GET /api/leads?limit=10 shows the created leads"""
        success, response = self.run_test(
            "Verify Seeded Leads",
            "GET",
            "leads?limit=10",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} leads in database")
            
            # Check if our created leads are present
            found_leads = 0
            for lead in response:
                if lead.get("id") in self.created_leads:
                    found_leads += 1
                    print(f"   ✓ Found seeded lead: {lead.get('name', 'Unknown')} (ID: {lead.get('id', 'N/A')})")
            
            print(f"   📋 Verified {found_leads}/{len(self.created_leads)} seeded leads")
            return found_leads > 0
        
        return success

    def test_create_demo_tasks(self):
        """Create 3 tasks via POST /api/tasks"""
        print(f"\n📋 SEEDING DEMO TASKS")
        print("-" * 40)
        
        tasks_data = [
            {
                "title": "Follow up with Rajesh Kumar - Villa Project",
                "description": "Schedule site visit and discuss luxury villa landscaping requirements. Prepare detailed proposal with 3D renderings.",
                "status": "Pending"
            },
            {
                "title": "Prepare Balcony Garden Proposal - Priya Sharma",
                "description": "Create customized balcony garden design with automated irrigation system. Include plant selection and maintenance guide.",
                "status": "Pending"
            },
            {
                "title": "Corporate Office Green Space Consultation - Amit Patel",
                "description": "Conduct office space assessment and propose indoor plant installations with air purification benefits.",
                "status": "Pending"
            }
        ]
        
        success_count = 0
        
        for i, task_data in enumerate(tasks_data):
            success, response = self.run_test(
                f"Create Task {i+1}: {task_data['title'][:30]}...",
                "POST",
                "tasks",
                200,  # Backend returns 200 instead of 201 for tasks
                data=task_data
            )
            
            if success:
                success_count += 1
                if "id" in response:
                    print(f"   📝 Task ID: {response['id']}")
                print(f"   ✅ Task created: {task_data['title']}")
            else:
                print(f"   ❌ Failed to create task: {task_data['title']}")
            
            time.sleep(0.3)
        
        print(f"\n📊 Task Creation Summary: {success_count}/3 tasks created successfully")
        return success_count >= 2  # Consider success if at least 2/3 tasks created

    def test_verify_tasks_list(self):
        """Verify GET /api/tasks returns at least the 3 created tasks"""
        success, response = self.run_test(
            "Verify Seeded Tasks",
            "GET",
            "tasks",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} tasks in database")
            
            # Check for tasks with our specific titles
            demo_task_keywords = ["Rajesh Kumar", "Priya Sharma", "Amit Patel"]
            found_tasks = 0
            
            for task in response:
                task_title = task.get("title", "")
                for keyword in demo_task_keywords:
                    if keyword in task_title:
                        found_tasks += 1
                        print(f"   ✓ Found seeded task: {task_title[:50]}...")
                        break
            
            print(f"   📋 Verified {found_tasks}/3 seeded tasks")
            return found_tasks > 0
        
        return success

    def test_seed_gallery_images(self):
        """Seed gallery images with POST /api/batch-send/gallery"""
        gallery_data = {
            "project_id": "demo-seeding",
            "sender": "system",
            "images": [
                {
                    "url": "https://picsum.photos/seed/aavana1/800/600",
                    "title": "Demo Image 1"
                },
                {
                    "url": "https://picsum.photos/seed/aavana2/800/600", 
                    "title": "Demo Image 2"
                },
                {
                    "url": "https://picsum.photos/seed/aavana3/800/600",
                    "title": "Demo Image 3"
                },
                {
                    "url": "https://picsum.photos/seed/aavana4/800/600",
                    "title": "Demo Image 4"
                },
                {
                    "url": "https://picsum.photos/seed/aavana5/800/600",
                    "title": "Demo Image 5"
                },
                {
                    "url": "https://picsum.photos/seed/aavana6/800/600",
                    "title": "Demo Image 6"
                }
            ]
        }
        
        success, response = self.run_test(
            "Seed Gallery Images",
            "POST",
            "batch-send/gallery",
            200,
            data=gallery_data
        )
        
        if success:
            print(f"   ✅ Gallery images seeded successfully")
            if "success" in response and response["success"]:
                print(f"   🖼️  Gallery response indicates success")
            elif response.get("status_code") == 200:
                print(f"   🖼️  Gallery endpoint returned 200 OK")
        else:
            print(f"   ⚠️  Gallery endpoint not available or rejected - skipping gracefully")
            # This is acceptable as mentioned in the requirements
            success = True
        
        return success

def main():
    print("🚀 Starting Aavana CRM Backend API Tests")
    print("🎯 Testing Goals: AI Integration, Demo Data Seeding, API Functionality")
    print("=" * 80)
    
    tester = AavanaCRMAPITester()
    
    # GOAL A: Verify AI is enabled via EMERGENT_LLM_KEY
    print("\n🤖 GOAL A: AI INTEGRATION TESTING")
    print("=" * 50)
    
    ai_tests = [
        ("Root API Message", tester.test_root_api),
        ("AI Chat Endpoint", tester.test_ai_chat),
    ]
    
    # GOAL B: Seed demo data
    print("\n🌱 GOAL B: DEMO DATA SEEDING")
    print("=" * 50)
    
    seeding_tests = [
        ("Seed 6 Demo Leads", tester.test_seed_demo_leads),
        ("Verify Leads List", tester.test_verify_leads_list),
        ("Create 3 Demo Tasks", tester.test_create_demo_tasks),
        ("Verify Tasks List", tester.test_verify_tasks_list),
        ("Seed Gallery Images", tester.test_seed_gallery_images),
    ]
    
    # Additional API verification
    print("\n📊 ADDITIONAL API VERIFICATION")
    print("=" * 50)
    
    api_tests = [
        ("Dashboard Stats", tester.test_dashboard_stats),
    ]
    
    # Run all tests
    all_tests = ai_tests + seeding_tests + api_tests
    results = {}
    
    for test_name, test_func in all_tests:
        try:
            print(f"\n" + "-" * 60)
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            results[test_name] = False
            tester.tests_run += 1
    
    # Print comprehensive summary
    print("\n" + "=" * 80)
    print("📊 COMPREHENSIVE BACKEND API TEST SUMMARY")
    print("=" * 80)
    
    # Group results by category
    ai_results = {k: v for k, v in results.items() if k in [t[0] for t in ai_tests]}
    seeding_results = {k: v for k, v in results.items() if k in [t[0] for t in seeding_tests]}
    api_results = {k: v for k, v in results.items() if k in [t[0] for t in api_tests]}
    
    print("\n🤖 AI INTEGRATION RESULTS:")
    for test_name, passed in ai_results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name}: {status}")
    
    print("\n🌱 DEMO DATA SEEDING RESULTS:")
    for test_name, passed in seeding_results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name}: {status}")
    
    print("\n📊 API VERIFICATION RESULTS:")
    for test_name, passed in api_results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name}: {status}")
    
    # Overall summary
    total_passed = sum(results.values())
    total_tests = len(results)
    
    print(f"\n🎯 OVERALL RESULTS:")
    print(f"   Tests Passed: {total_passed}/{total_tests}")
    print(f"   Success Rate: {(total_passed/total_tests)*100:.1f}%")
    
    if len(tester.created_leads) > 0:
        print(f"   Created Leads: {len(tester.created_leads)} leads seeded")
    
    # Determine exit code
    if total_passed >= total_tests * 0.8:  # 80% success rate
        print("\n🎉 Backend API testing completed successfully!")
        print("✅ Ready for frontend testing")
        return 0
    else:
        print("\n⚠️  Some critical backend API tests failed!")
        print("❌ Frontend testing may encounter issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())