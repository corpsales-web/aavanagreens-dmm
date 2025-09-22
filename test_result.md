#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

## user_problem_statement: PROJECT HANDOFF - AAVANA GREENS CRM

## backend:
##   - task: "Health endpoint and gallery seed + lead qualification fallback"
##     implemented: true
##     working: true
##     file: "/app/backend/server.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: "NA"
##         -agent: "main"
##         -comment: "Added /api/health, /api/gallery/seed seeding with picsum placeholder, and /api/leads/qualify deterministic rules-based fallback (no external keys needed). Preserved Mongo + CORS + /api prefix rules."
##         -working: true
##         -agent: "testing"
##         -comment: "All backend API tests passed: Health endpoint returns status=ok and db=ok, Gallery seed correctly inserts requested count (tested with 3 items), Lead qualification returns proper score/stage/reasoning/model_used fields with correct data types and valid values. API accessible at https://crm-whatsapp-hub.preview.emergentagent.com/api"

## frontend:
##   - task: "Seed UI + Lead Qualification UI + Modal z-index fix"
##     implemented: true
##     working: true
##     file: "/app/frontend/src/App.js"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: "NA"
##         -agent: "main"
##         -comment: "Added UI panels for gallery seeding and lead qualification, included robust modal overlay with high z-index; wired to backend via REACT_APP_BACKEND_URL env using /api prefix."
##         -working: true
##         -agent: "testing"
##         -comment: "All frontend UI tests passed: Aavana branding visible, Made with Emergent badge present, Dashboard shows API as Healthy, Gallery seeding works (tested count=2, reset=true, shows 'Inserted: 2'), Lead qualification form works (filled all fields, shows score=95, stage=Qualified, proper reasoning and model), Modal opens/closes correctly with proper overlay. No errors found on page."

## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 1
##   run_ui: true

## test_plan:
##   current_focus:
##     - "Seed admin user via /api/auth/seed-admin"
##     - "Backend AI chat fast-path /api/ai/chat"
##     - "Aavana 2.0 chat endpoints (specialized, enhanced, standard)"
##   stuck_tasks:
##     - "Marketing modal runtime error regression"
##   test_all: false
##   test_priority: "high_first"

## agent_communication:
##     -agent: "main"
##     -message: "Please run automated smoke tests for the three endpoints and the new UI panels. Use screenshots to confirm and share console logs if failures occur."
##     -agent: "testing"
##     -message: "Comprehensive testing completed successfully. Backend: All 4 API endpoints working (root, health, gallery/seed, leads/qualify). Frontend: All UI components functional including Aavana branding, stat cards showing API as Healthy, gallery seeding with count/reset, lead qualification form with proper results display, and modal overlay functionality. Integration between frontend and backend working perfectly via REACT_APP_BACKEND_URL. No errors or issues found. Screenshots and console logs captured for verification."