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

#====================================================================================================
# END - Testing Protocol Section
#====================================================================================================

## user_problem_statement: "Run UI smoke on the preview domain: 1) On Campaign Manager, scroll below Budget and locate 'Tracking & UTM' section; fill Base URL and utm_* fields; verify Tracking URL generated; save campaign; 2) Go to Approvals, find saved item, confirm Tracking URL present and Copy button; 3) Click Connect Meta in TopNav and confirm request goes to /api/meta/oauth/start (no undefined). Capture screenshots and report errors."

## frontend:
  - task: "UTM builder UI + Connect Meta relative path"
    implemented: false
    working: false
    file: "/app/dmm-frontend/src/pages/Campaigns.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: false
        -agent: "testing"
        -comment: "CRITICAL: UTM tracking section is NOT implemented in Campaigns.jsx. Code review shows no 'Tracking & UTM' section, no Base URL field, no utm_* fields, and no tracking URL generation. The current form only has basic campaign fields (name, objective, audience, budget, channels). This feature needs to be implemented before testing can proceed."

## metadata:
  created_by: "testing_agent"
  version: "1.0"
  test_sequence: 1

## test_plan:
  current_focus:
    - "UTM tracking section implementation in Campaigns.jsx"
    - "TopNav Connect Meta button functionality"
  stuck_tasks:
    - "UTM builder UI + Connect Meta relative path"
  test_all: false
  test_priority: "high_first"

## agent_communication:
    -agent: "testing"
    -message: "Code review completed. UTM tracking functionality is NOT implemented in the frontend. The Campaigns.jsx file lacks the required 'Tracking & UTM' section with Base URL and utm_* fields. Need main agent to implement this feature before UI testing can proceed. Will test Connect Meta button functionality as it appears to be implemented."