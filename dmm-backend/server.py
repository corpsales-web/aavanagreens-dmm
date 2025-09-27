import os
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from jose import jwt, JWTError
from motor.motor_asyncio import AsyncIOMotorClient

# ----------------------
# Env & App Setup
# ----------------------
MONGO_URL = os.environ.get("MONGO_URL_DMM", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME_DMM", "aavana_dmm")
JWT_SECRET = os.environ.get("DMM_JWT_SECRET", "change-me")
CORS_ORIGINS = os.environ.get("DMM_CORS_ORIGINS", "*").split(",")

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
    }

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "dmm-backend", "time": now_iso()}

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