import os
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from jose import jwt, JWTError
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load environment variables
load_dotenv()

# ----------------------
# Env & App Setup
# ----------------------
MONGO_URL = os.environ.get("MONGO_URL_DMM", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME_DMM", "aavana_dmm")
JWT_SECRET = os.environ.get("DMM_JWT_SECRET", "change-me")
CORS_ORIGINS = os.environ.get("DMM_CORS_ORIGINS", "*").split(",")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

app = FastAPI(title="DMM Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mongo_client: Optional[AsyncIOMotorClient] = None

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

# Mongo helpers
async def get_db():
    global mongo_client
    if mongo_client is None:
        mongo_client = AsyncIOMotorClient(MONGO_URL)
    return mongo_client[DB_NAME]

# Serialization helpers (no ObjectId leakage)
class ApproveFilters(BaseModel):
    geo: Optional[str] = None
    language: Optional[List[str]] = None
    device: Optional[List[str]] = None
    time: Optional[str] = None
    behavior: Optional[List[str]] = None

class SaveRequest(BaseModel):
    item_type: str
    data: Dict[str, Any] = Field(default_factory=dict)
    default_filters: Optional[ApproveFilters] = None

class ListQuery(BaseModel):
    type: str
    status: Optional[str] = None

class ApproveRequest(BaseModel):
    item_type: str
    item_id: str
    status: str = "Approved"
    filters: Optional[ApproveFilters] = None
    approved_by: str = "system"

# AI Strategy Request Models
class StrategyRequest(BaseModel):
    company_name: str
    industry: str
    target_audience: str
    budget: Optional[str] = None
    goals: List[str] = Field(default_factory=list)
    website_url: Optional[str] = None

class ContentRequest(BaseModel):
    content_type: str  # "reel", "ugc", "brand", "influencer"
    brief: str
    target_audience: str
    platform: str
    budget: Optional[str] = None
    festival: Optional[str] = None

class CampaignRequest(BaseModel):
    campaign_name: str
    objective: str
    target_audience: str
    budget: float
    channels: List[str]
    duration_days: int

# JWT SSO consume
class SSOConsumeRequest(BaseModel):
    token: str

async def collections_map(db):
    return {
        "campaign": db["marketing_campaigns"],
        "reel": db["marketing_reels"],
        "ugc": db["marketing_ugc"],
        "brand": db["marketing_brand_assets"],
        "influencer": db["marketing_influencers"],
        "approvals": db["marketing_approvals"],
        "strategy": db["marketing_strategies"],
    }

# AI Orchestration Helpers
async def get_ai_chat():
    """Initialize AI chat with GPT-5 beta"""
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"dmm-{str(uuid.uuid4())[:8]}",
        system_message="You are an expert Digital Marketing Manager AI. You specialize in creating comprehensive marketing strategies, content creation, and campaign optimization. Always provide detailed, actionable insights."
    ).with_model("openai", "gpt-5")
    return chat

async def generate_marketing_strategy(request: StrategyRequest):
    """Generate comprehensive marketing strategy using GPT-5 beta"""
    chat = await get_ai_chat()
    
    prompt = f"""
    Create a comprehensive digital marketing strategy for:
    Company: {request.company_name}
    Industry: {request.industry}
    Target Audience: {request.target_audience}
    Budget: {request.budget or 'Not specified'}
    Goals: {', '.join(request.goals) if request.goals else 'General growth'}
    Website: {request.website_url or 'Not provided'}
    
    Please provide:
    1. Market Analysis & Positioning
    2. Content Strategy (types, frequency, platforms)
    3. Channel Mix Recommendations
    4. Budget Allocation Suggestions
    5. KPI & Success Metrics
    6. Timeline & Milestones
    7. Potential Challenges & Solutions
    
    Format as detailed JSON with clear sections.
    """
    
    user_message = UserMessage(text=prompt)
    response = await chat.send_message(user_message)
    return response

async def generate_content_ideas(request: ContentRequest):
    """Generate content ideas using GPT-5 beta"""
    chat = await get_ai_chat()
    
    prompt = f"""
    Generate creative content ideas for:
    Content Type: {request.content_type}
    Brief: {request.brief}
    Target Audience: {request.target_audience}
    Platform: {request.platform}
    Budget: {request.budget or 'Flexible'}
    Festival/Theme: {request.festival or 'None'}
    
    Please provide:
    1. 5 creative concepts with detailed descriptions
    2. Visual style recommendations
    3. Messaging & tone suggestions
    4. Hashtag recommendations
    5. Estimated production costs
    6. Performance predictions
    
    Format as detailed JSON with clear structure.
    """
    
    user_message = UserMessage(text=prompt)
    response = await chat.send_message(user_message)
    return response

async def optimize_campaign(request: CampaignRequest):
    """Optimize campaign strategy using GPT-5 beta"""
    chat = await get_ai_chat()
    
    prompt = f"""
    Optimize this marketing campaign:
    Campaign: {request.campaign_name}
    Objective: {request.objective}
    Target Audience: {request.target_audience}
    Budget: ${request.budget}
    Channels: {', '.join(request.channels)}
    Duration: {request.duration_days} days
    
    Please provide:
    1. Channel-specific budget allocation
    2. Timeline optimization
    3. Creative requirements per channel
    4. Targeting parameters
    5. Expected ROI & KPIs
    6. Risk assessment & mitigation
    7. A/B testing recommendations
    
    Format as detailed JSON with clear sections.
    """
    
    user_message = UserMessage(text=prompt)
    response = await chat.send_message(user_message)
    return response

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "dmm-backend", "time": now_iso()}

@app.get("/api/debug/env")
async def debug_env():
    return {
        "emergent_llm_key_present": bool(EMERGENT_LLM_KEY),
        "emergent_llm_key_length": len(EMERGENT_LLM_KEY) if EMERGENT_LLM_KEY else 0
    }

@app.post("/api/auth/sso/consume")
async def sso_consume(req: SSOConsumeRequest):
    try:
        payload = jwt.decode(req.token, JWT_SECRET, algorithms=["HS256"])  # type: ignore
        return {"ok": True, "user": {k: payload.get(k) for k in ["sub", "email", "name", "roles"]}}
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@app.post("/api/marketing/save")
async def marketing_save(body: SaveRequest, db=Depends(get_db)):
    cmap = await collections_map(db)
    if body.item_type not in cmap:
        raise HTTPException(status_code=400, detail="Invalid item_type")
    doc = dict(body.data)
    doc.setdefault("id", str(uuid.uuid4()))
    doc.setdefault("status", "Pending Approval")
    if body.default_filters:
        doc["approval_filters"] = body.default_filters.dict(exclude_none=True)
    doc["created_at"], doc["updated_at"] = now_iso(), now_iso()
    await cmap[body.item_type].insert_one(doc)
    doc.pop("_id", None)
    return {"success": True, "item": doc}

@app.get("/api/marketing/list")
async def marketing_list(type: str, status: Optional[str] = None, db=Depends(get_db)):
    cmap = await collections_map(db)
    if type not in cmap:
        raise HTTPException(status_code=400, detail="Invalid type")
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    items = await cmap[type].find(q, {"_id": 0}).to_list(length=500)
    return items

@app.post("/api/marketing/approve")
async def marketing_approve(body: ApproveRequest, db=Depends(get_db)):
    cmap = await collections_map(db)
    if body.item_type not in cmap:
        raise HTTPException(status_code=400, detail="Invalid item_type")
    updates: Dict[str, Any] = {
        "status": body.status,
        "updated_at": now_iso(),
    }
    if body.filters:
        updates["approval_filters"] = body.filters.dict(exclude_none=True)
    await cmap[body.item_type].update_one({"id": body.item_id}, {"$set": updates})
    updated = await cmap[body.item_type].find_one({"id": body.item_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    approval_log = {
        "id": str(uuid.uuid4()),
        "item_type": body.item_type,
        "item_id": body.item_id,
        "status": body.status,
        "filters": updates.get("approval_filters"),
        "approved_by": body.approved_by,
        "created_at": now_iso(),
    }
    await (await collections_map(db))["approvals"].insert_one(approval_log)
    return {"success": True, "item": updated}

# ----------------------
# AI Orchestration Endpoints
# ----------------------

@app.post("/api/ai/generate-strategy")
async def ai_generate_strategy(request: StrategyRequest, db=Depends(get_db)):
    """Generate marketing strategy using GPT-5 beta"""
    try:
        if not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        strategy_content = await generate_marketing_strategy(request)
        
        # Save strategy to database
        strategy_doc = {
            "id": str(uuid.uuid4()),
            "company_name": request.company_name,
            "industry": request.industry,
            "target_audience": request.target_audience,
            "budget": request.budget,
            "goals": request.goals,
            "website_url": request.website_url,
            "strategy_content": strategy_content,
            "status": "Generated",
            "created_at": now_iso(),
            "updated_at": now_iso()
        }
        
        cmap = await collections_map(db)
        await cmap["strategy"].insert_one(strategy_doc)
        strategy_doc.pop("_id", None)
        
        return {"success": True, "strategy": strategy_doc}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI strategy generation failed: {str(e)}")

@app.post("/api/ai/generate-content")
async def ai_generate_content(request: ContentRequest, db=Depends(get_db)):
    """Generate content ideas using GPT-5 beta"""
    try:
        if not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        content_ideas = await generate_content_ideas(request)
        
        # Save content ideas to appropriate collection
        content_doc = {
            "id": str(uuid.uuid4()),
            "content_type": request.content_type,
            "brief": request.brief,
            "target_audience": request.target_audience,
            "platform": request.platform,
            "budget": request.budget,
            "festival": request.festival,
            "ai_content": content_ideas,
            "status": "Generated",
            "created_at": now_iso(),
            "updated_at": now_iso()
        }
        
        cmap = await collections_map(db)
        # Map content type to collection
        collection_map = {
            "reel": "reel",
            "ugc": "ugc", 
            "brand": "brand",
            "influencer": "influencer"
        }
        collection_key = collection_map.get(request.content_type, "reel")
        await cmap[collection_key].insert_one(content_doc)
        content_doc.pop("_id", None)
        
        return {"success": True, "content": content_doc}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI content generation failed: {str(e)}")

@app.post("/api/ai/optimize-campaign")
async def ai_optimize_campaign(request: CampaignRequest, db=Depends(get_db)):
    """Optimize campaign using GPT-5 beta"""
    try:
        if not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        optimization = await optimize_campaign(request)
        
        # Save optimized campaign
        campaign_doc = {
            "id": str(uuid.uuid4()),
            "campaign_name": request.campaign_name,
            "objective": request.objective,
            "target_audience": request.target_audience,
            "budget": request.budget,
            "channels": request.channels,
            "duration_days": request.duration_days,
            "ai_optimization": optimization,
            "status": "Optimized",
            "created_at": now_iso(),
            "updated_at": now_iso()
        }
        
        cmap = await collections_map(db)
        await cmap["campaign"].insert_one(campaign_doc)
        campaign_doc.pop("_id", None)
        
        return {"success": True, "campaign": campaign_doc}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI campaign optimization failed: {str(e)}")

@app.get("/api/ai/strategies")
async def list_strategies(db=Depends(get_db)):
    """List all generated strategies"""
    cmap = await collections_map(db)
    strategies = await cmap["strategy"].find({}, {"_id": 0}).to_list(length=100)
    return strategies