from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Aavana Greens CRM API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ------------------------
# Models
# ------------------------
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class HealthResponse(BaseModel):
    status: str
    db: str
    timestamp: datetime

class GallerySeedRequest(BaseModel):
    count: int = 9
    reset: bool = False
    category: Optional[str] = "project"

class GalleryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    image_url: str
    category: str = "project"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Lead(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = None

class LeadQualificationResult(BaseModel):
    score: int
    stage: str
    reasoning: str
    model_used: str

class LeadQualificationRequest(BaseModel):
    lead: Lead
    model: Optional[str] = None


# ------------------------
# Basic Routes
# ------------------------
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.dict())
    await db.status_checks.insert_one(status_obj.dict())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# ------------------------
# Health
# ------------------------
@api_router.get("/health", response_model=HealthResponse)
async def health():
    try:
        # Try a lightweight db command
        _ = await db.command('ping')
        db_status = "ok"
    except Exception as e:
        logging.exception("Mongo ping failed")
        db_status = f"error: {e}"
    return HealthResponse(status="ok", db=db_status, timestamp=datetime.utcnow())


# ------------------------
# Gallery Seed
# ------------------------
@api_router.post("/gallery/seed")
async def seed_gallery(req: GallerySeedRequest):
    coll = db.gallery_items
    inserted = 0

    if req.reset:
        await coll.delete_many({})

    docs: List[dict] = []
    for i in range(req.count):
        gid = str(uuid.uuid4())
        title = f"Sample Image {i + 1}"
        # Deterministic placeholder images
        image_url = f"https://picsum.photos/seed/{gid}/800/600"
        item = GalleryItem(
            id=gid,
            title=title,
            image_url=image_url,
            category=req.category or "project",
            tags=[req.category or "project", "sample", "auto-seeded"],
        )
        docs.append(item.dict())

    if docs:
        result = await coll.insert_many(docs)
        inserted = len(result.inserted_ids)

    return {"inserted": inserted}


# ------------------------
# Lead Qualification (LLM or deterministic fallback)
# ------------------------

def _rule_based_qualify(lead: Lead) -> LeadQualificationResult:
    # Simple deterministic scoring as safe fallback (no external calls)
    score = 50
    reasons = []

    if lead.source and lead.source.lower() in {"referral", "website"}:
        score += 15
        reasons.append("High-intent source")

    if lead.email and lead.email.endswith((".com", ".in")):
        score += 10
        reasons.append("Valid email domain")

    if lead.phone and len(''.join([c for c in lead.phone if c.isdigit()])) >= 10:
        score += 10
        reasons.append("Phone number present")

    if lead.notes:
        n = lead.notes.lower()
        if any(k in n for k in ["buy", "purchase", "timeline", "budget", "quotation", "quote"]):
            score += 10
            reasons.append("Buying intent keywords detected")
        if any(k in n for k in ["just looking", "browsing", "later"]):
            score -= 10
            reasons.append("Low-intent phrases detected")

    score = max(0, min(100, score))
    if score >= 75:
        stage = "Qualified"
    elif score >= 55:
        stage = "Contacted"
    else:
        stage = "New"

    reasoning = "; ".join(reasons) or "Default baseline score assigned."
    return LeadQualificationResult(score=score, stage=stage, reasoning=reasoning, model_used="rules-fallback")


@api_router.post("/leads/qualify", response_model=LeadQualificationResult)
async def qualify_lead(req: LeadQualificationRequest):
    # NOTE: We intentionally use a deterministic fallback to avoid external deps during setup.
    # When EMERGENT_LLM_KEY is present and emergent integrations client is installed,
    # you can replace this with an actual LLM call while keeping the same response model.
    emergent_key = os.environ.get("EMERGENT_LLM_KEY")

    # For now, we use the deterministic rules to ensure the endpoint is always functional
    result = _rule_based_qualify(req.lead)

    # Attach the model hint chosen by user if provided (for observability only)
    if req.model and result.model_used == "rules-fallback":
        result.model_used = f"rules-fallback (requested: {req.model})"

    return result


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()