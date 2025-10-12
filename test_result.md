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
# ##   - task: "Campaign UTM builder (backend persists utm_* and tracking_url)"
# ##     implemented: true
# ##     working: "NA"
# ##     file: "/app/dmm-backend/server.py"
# ##     stuck_count: 0
# ##     priority: "high"
# ##     needs_retesting: true
# ##     status_history:
# ##         -working: "NA"
# ##         -agent: "main"
# ##         -comment: "Added support to persist utm_source, utm_medium, utm_campaign, utm_term, utm_content, base_url, tracking_url if provided on campaign save." 
# ##
# ## frontend:
# ##   - task: "UTM builder UI + Connect Meta relative path"
# ##     implemented: true
# ##     working: "NA"
# ##     file: "/app/dmm-frontend/src/pages/Campaigns.jsx"
# ##     stuck_count: 0
# ##     priority: "high"
# ##     needs_retesting: true
# ##     status_history:
# ##         -working: "NA"
# ##         -agent: "main"
# ##         -comment: "Added Tracking & UTM section with computed URL; changed Connect Meta button to relative API path and rebuilt." 
# ##
# ## metadata:
# ##   created_by: "main_agent"
# ##   version: "1.7"
# ##   test_sequence: 9
# ##   run_ui: true
# ##
# ## test_plan:
# ##   current_focus:
# ##     - "Frontend: verify UTM section appears and generates tracking URL; Approvals shows URL + Copy"
# ##     - "TopNav: Connect Meta redirects via /api/meta/oauth/start"
# ##   stuck_tasks: []
# ##   test_all: false
# ##   test_priority: "high_first"
# ##
# ## agent_communication:
# ##     -agent: "main"
# ##     -message: "Run a UI smoke on preview: 1) UTM section visible below Budget; 2) Generate URL and save; 3) Approvals shows tracking URL; 4) Connect Meta redirects without 'undefined' URLs."