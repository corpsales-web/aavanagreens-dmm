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
# ## user_problem_statement: {problem_statement}
# ## backend:
# ##   - task: "Meta OAuth + publish (stub currently, wiring UI button)"
# ##     implemented: true
# ##     working: "NA"
# ##     file: "/app/dmm-backend/server.py"
# ##     stuck_count: 0
# ##     priority: "high"
# ##     needs_retesting: true
# ##     status_history:
# ##         -working: "NA"
# ##         -agent: "main"
# ##         -comment: "Exposed GET /api/meta/oauth/start for Connect Meta button; fixed frontend env usage to drop localhost fallback; rebuilt."
# ##
# ## frontend:
# ##   - task: "Connect Meta button in TopNav"
# ##     implemented: true
# ##     working: "NA"
# ##     file: "/app/dmm-frontend/src/components/TopNav.jsx"
# ##     stuck_count: 0
# ##     priority: "high"
# ##     needs_retesting: true
# ##     status_history:
# ##         -working: "NA"
# ##         -agent: "main"
# ##         -comment: "Updated to use REACT_APP_BACKEND_URL/VITE_BACKEND_URL only; rebuilt and restarted frontend."
# ##
# ## metadata:
# ##   created_by: "main_agent"
# ##   version: "1.6"
# ##   test_sequence: 8
# ##   run_ui: true
# ##
# ## test_plan:
# ##   current_focus:
# ##     - "Frontend smoke: Connect Meta redirect works; Approvals mock publish/design works"
# ##   stuck_tasks: []
# ##   test_all: false
# ##   test_priority: "high_first"
# ##
# ## agent_communication:
# ##     -agent: "main"
# ##     -message: "Please re-run UI smoke now that frontend env fallback was removed, then share screenshots."