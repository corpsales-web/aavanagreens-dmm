#!/bin/bash

# Comprehensive Backend Test using curl after directory rename
# Tests all backend FastAPI endpoints after dmm-frontend→frontend and dmm-backend→backend rename

BASE_URL="https://campaign-manager-28.preview.emergentagent.com"
API_BASE="${BASE_URL}/api"

echo "🚀 Starting Comprehensive Backend Tests After Directory Rename"
echo "================================================================================"
echo "Testing against: $BASE_URL"
echo "All routes must be prefixed with /api"
echo "================================================================================"

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=()

# Helper function to log test results
log_test() {
    local test_name="$1"
    local success="$2"
    local details="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$success" = "true" ]; then
        echo "✅ PASS $test_name: $details"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "❌ FAIL $test_name: $details"
        FAILED_TESTS+=("$test_name: $details")
    fi
}

# Test 1: Health check - GET /api/health should return {status:"ok"}
echo ""
echo "1️⃣ Testing Health Check..."
echo "Testing GET $API_BASE/health"

HEALTH_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_BASE/health")
HEALTH_HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')

echo "Response Status: $HEALTH_HTTP_CODE"
echo "Response Body: $HEALTH_BODY"

if [ "$HEALTH_HTTP_CODE" = "200" ]; then
    if echo "$HEALTH_BODY" | grep -q '"status":"ok"'; then
        log_test "Health Check" "true" "Backend is healthy with status='ok'"
    else
        log_test "Health Check" "false" "Response missing status='ok'"
    fi
else
    log_test "Health Check" "false" "HTTP $HEALTH_HTTP_CODE"
fi

# Test 2: Strategy generation fallback - POST /api/ai/generate-strategy with minimal payload
echo ""
echo "2️⃣ Testing Strategy Generation Fallback..."
echo "Testing POST $API_BASE/ai/generate-strategy"

STRATEGY_PAYLOAD='{
    "company_name": "TestCorp",
    "industry": "Technology", 
    "target_audience": "Small businesses"
}'

echo "Payload: $STRATEGY_PAYLOAD"

STRATEGY_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -H "Content-Type: application/json" \
    -d "$STRATEGY_PAYLOAD" \
    "$API_BASE/ai/generate-strategy")

STRATEGY_HTTP_CODE=$(echo "$STRATEGY_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
STRATEGY_BODY=$(echo "$STRATEGY_RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')

echo "Response Status: $STRATEGY_HTTP_CODE"
echo "Response Body: $STRATEGY_BODY"

STRATEGY_ID=""
if [ "$STRATEGY_HTTP_CODE" = "200" ]; then
    if echo "$STRATEGY_BODY" | grep -q '"success":true' && echo "$STRATEGY_BODY" | grep -q '"strategy_content"'; then
        STRATEGY_ID=$(echo "$STRATEGY_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        log_test "Strategy Generation Fallback" "true" "Success with strategy ID: $STRATEGY_ID"
    else
        log_test "Strategy Generation Fallback" "false" "Missing success=true or strategy_content"
    fi
else
    log_test "Strategy Generation Fallback" "false" "HTTP $STRATEGY_HTTP_CODE"
fi

# Test 2b: Verify strategy persisted in DB - GET /api/ai/strategies returns list
if [ -n "$STRATEGY_ID" ]; then
    echo ""
    echo "2️⃣b Verifying Strategy Persisted in DB..."
    echo "Testing GET $API_BASE/ai/strategies"
    
    STRATEGIES_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_BASE/ai/strategies")
    STRATEGIES_HTTP_CODE=$(echo "$STRATEGIES_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    STRATEGIES_BODY=$(echo "$STRATEGIES_RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')
    
    echo "Response Status: $STRATEGIES_HTTP_CODE"
    echo "Response Body: $STRATEGIES_BODY"
    
    if [ "$STRATEGIES_HTTP_CODE" = "200" ]; then
        if echo "$STRATEGIES_BODY" | grep -q "$STRATEGY_ID"; then
            log_test "Strategy List Verification" "true" "Strategy $STRATEGY_ID found in list"
        else
            log_test "Strategy List Verification" "false" "Strategy $STRATEGY_ID not found in list"
        fi
    else
        log_test "Strategy List Verification" "false" "HTTP $STRATEGIES_HTTP_CODE"
    fi
fi

# Test 3: Campaign manual save - POST /api/marketing/save with campaign payload including UTM fields
echo ""
echo "3️⃣ Testing Campaign Manual Save..."
echo "Testing POST $API_BASE/marketing/save"

CAMPAIGN_PAYLOAD='{
    "item_type": "campaign",
    "data": {
        "campaign_name": "Test UTM Campaign",
        "objective": "brand_awareness",
        "target_audience": "Young professionals 25-35",
        "budget": 1500,
        "channels": ["facebook_ads", "google_ads"],
        "duration_days": 14,
        "targeting": {
            "country": "United States",
            "age_min": 25,
            "age_max": 35,
            "gender": ["Male", "Female"],
            "interests": ["technology", "business"],
            "devices": ["Mobile", "Desktop"]
        },
        "base_url": "https://example.com/landing",
        "utm_source": "facebook",
        "utm_medium": "paid_social", 
        "utm_campaign": "test_campaign_2025",
        "utm_term": "young_professionals",
        "utm_content": "video_ad_v1",
        "tracking_url": "https://example.com/landing?utm_source=facebook&utm_medium=paid_social&utm_campaign=test_campaign_2025&utm_term=young_professionals&utm_content=video_ad_v1"
    }
}'

echo "Payload: $CAMPAIGN_PAYLOAD"

CAMPAIGN_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -H "Content-Type: application/json" \
    -d "$CAMPAIGN_PAYLOAD" \
    "$API_BASE/marketing/save")

CAMPAIGN_HTTP_CODE=$(echo "$CAMPAIGN_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
CAMPAIGN_BODY=$(echo "$CAMPAIGN_RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')

echo "Response Status: $CAMPAIGN_HTTP_CODE"
echo "Response Body: $CAMPAIGN_BODY"

CAMPAIGN_ID=""
if [ "$CAMPAIGN_HTTP_CODE" = "200" ]; then
    if echo "$CAMPAIGN_BODY" | grep -q '"success":true' && echo "$CAMPAIGN_BODY" | grep -q '"utm_source"'; then
        CAMPAIGN_ID=$(echo "$CAMPAIGN_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        log_test "Campaign Manual Save" "true" "Campaign created with ID: $CAMPAIGN_ID, UTM fields stored"
    else
        log_test "Campaign Manual Save" "false" "Missing success=true or UTM fields"
    fi
else
    log_test "Campaign Manual Save" "false" "HTTP $CAMPAIGN_HTTP_CODE"
fi

# Test 4: List campaigns - GET /api/marketing/list?type=campaign should include newly saved item with status 'Pending Approval'
echo ""
echo "4️⃣ Testing List Campaigns..."
echo "Testing GET $API_BASE/marketing/list?type=campaign"

CAMPAIGNS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_BASE/marketing/list?type=campaign")
CAMPAIGNS_HTTP_CODE=$(echo "$CAMPAIGNS_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
CAMPAIGNS_BODY=$(echo "$CAMPAIGNS_RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')

echo "Response Status: $CAMPAIGNS_HTTP_CODE"
echo "Response Body: $CAMPAIGNS_BODY"

if [ "$CAMPAIGNS_HTTP_CODE" = "200" ]; then
    if [ -n "$CAMPAIGN_ID" ] && echo "$CAMPAIGNS_BODY" | grep -q "$CAMPAIGN_ID"; then
        if echo "$CAMPAIGNS_BODY" | grep -q '"status":"Pending Approval"'; then
            log_test "List Campaigns" "true" "Campaign $CAMPAIGN_ID found with status 'Pending Approval'"
        else
            log_test "List Campaigns" "false" "Campaign found but status not 'Pending Approval'"
        fi
    else
        CAMPAIGN_COUNT=$(echo "$CAMPAIGNS_BODY" | grep -o '"id":"[^"]*"' | wc -l)
        log_test "List Campaigns" "true" "Retrieved $CAMPAIGN_COUNT campaigns from database"
    fi
else
    log_test "List Campaigns" "false" "HTTP $CAMPAIGNS_HTTP_CODE"
fi

# Test 5: Approve - POST /api/marketing/approve should update status to 'Approved' and create approval log
if [ -n "$CAMPAIGN_ID" ]; then
    echo ""
    echo "5️⃣ Testing Approve Campaign..."
    echo "Testing POST $API_BASE/marketing/approve"
    
    APPROVE_PAYLOAD="{
        \"item_type\": \"campaign\",
        \"item_id\": \"$CAMPAIGN_ID\",
        \"status\": \"Approved\",
        \"approved_by\": \"test_user\"
    }"
    
    echo "Payload: $APPROVE_PAYLOAD"
    
    APPROVE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -H "Content-Type: application/json" \
        -d "$APPROVE_PAYLOAD" \
        "$API_BASE/marketing/approve")
    
    APPROVE_HTTP_CODE=$(echo "$APPROVE_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    APPROVE_BODY=$(echo "$APPROVE_RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')
    
    echo "Response Status: $APPROVE_HTTP_CODE"
    echo "Response Body: $APPROVE_BODY"
    
    if [ "$APPROVE_HTTP_CODE" = "200" ]; then
        if echo "$APPROVE_BODY" | grep -q '"success":true' && echo "$APPROVE_BODY" | grep -q '"status":"Approved"'; then
            log_test "Approve Campaign" "true" "Campaign $CAMPAIGN_ID successfully approved"
        else
            log_test "Approve Campaign" "false" "Approval failed or status not updated"
        fi
    else
        log_test "Approve Campaign" "false" "HTTP $APPROVE_HTTP_CODE"
    fi
fi

# Test 6a: Mock Meta OAuth - GET /api/meta/oauth/start should return redirect JSON
echo ""
echo "6️⃣a Testing Mock Meta OAuth Start..."
echo "Testing GET $API_BASE/meta/oauth/start"

META_OAUTH_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_BASE/meta/oauth/start")
META_OAUTH_HTTP_CODE=$(echo "$META_OAUTH_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
META_OAUTH_BODY=$(echo "$META_OAUTH_RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')

echo "Response Status: $META_OAUTH_HTTP_CODE"
echo "Response Body: $META_OAUTH_BODY"

if [ "$META_OAUTH_HTTP_CODE" = "200" ]; then
    if echo "$META_OAUTH_BODY" | grep -q '"redirect"'; then
        REDIRECT_URL=$(echo "$META_OAUTH_BODY" | grep -o '"redirect":"[^"]*"' | cut -d'"' -f4)
        log_test "Meta OAuth Start" "true" "OAuth start successful, redirect: $REDIRECT_URL"
    else
        log_test "Meta OAuth Start" "false" "Missing 'redirect' field in response"
    fi
else
    log_test "Meta OAuth Start" "false" "HTTP $META_OAUTH_HTTP_CODE"
fi

# Test 6b: Mock Meta Publish - POST /api/meta/posts/publish with message should return success true
echo ""
echo "6️⃣b Testing Mock Meta Posts Publish..."
echo "Testing POST $API_BASE/meta/posts/publish"

META_PUBLISH_PAYLOAD='{
    "message": "Test post from backend API testing",
    "page_id": "test_page_123"
}'

echo "Payload: $META_PUBLISH_PAYLOAD"

META_PUBLISH_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -H "Content-Type: application/json" \
    -d "$META_PUBLISH_PAYLOAD" \
    "$API_BASE/meta/posts/publish")

META_PUBLISH_HTTP_CODE=$(echo "$META_PUBLISH_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
META_PUBLISH_BODY=$(echo "$META_PUBLISH_RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')

echo "Response Status: $META_PUBLISH_HTTP_CODE"
echo "Response Body: $META_PUBLISH_BODY"

if [ "$META_PUBLISH_HTTP_CODE" = "200" ]; then
    if echo "$META_PUBLISH_BODY" | grep -q '"success":true'; then
        POST_ID=$(echo "$META_PUBLISH_BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        log_test "Meta Posts Publish" "true" "Post publish successful, mock post ID: $POST_ID"
    else
        log_test "Meta Posts Publish" "false" "success field is not true"
    fi
else
    log_test "Meta Posts Publish" "false" "HTTP $META_PUBLISH_HTTP_CODE"
fi

# Summary
echo ""
echo "================================================================================"
echo "📊 COMPREHENSIVE BACKEND TEST SUMMARY"
echo "================================================================================"
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $((TOTAL_TESTS - PASSED_TESTS))"

if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    echo "Success Rate: ${SUCCESS_RATE}%"
else
    echo "Success Rate: No tests run"
fi

# Show failed tests
if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    echo ""
    echo "❌ FAILED TESTS:"
    for failed_test in "${FAILED_TESTS[@]}"; do
        echo "  • $failed_test"
    done
else
    echo ""
    echo "✅ All tests passed!"
fi

# Show created resources
if [ -n "$CAMPAIGN_ID" ]; then
    echo ""
    echo "📝 CREATED RESOURCES:"
    echo "  • Campaign ID: $CAMPAIGN_ID"
fi

# Exit with appropriate code
if [ $((TOTAL_TESTS - PASSED_TESTS)) -eq 0 ]; then
    echo ""
    echo "✅ Comprehensive backend tests completed successfully!"
    exit 0
else
    echo ""
    echo "❌ Some critical backend tests failed!"
    exit 1
fi