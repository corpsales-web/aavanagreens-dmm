from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any, Union
import uuid
import json
from datetime import datetime, timezone, timedelta
from enum import Enum
import hashlib
import jwt
import secrets
from pywebpush import webpush, WebPushException

# Import AI service
from ai_service import (
    ai_service, 
    VoiceTaskRequest, 
    VoiceTaskResponse,
    AIInsightRequest,
    AIInsightResponse,
    ContentGenerationRequest,
    ContentGenerationResponse
)

# Import enhanced AI service
try:
    from catalogue_service import catalogue_service
    try:
        from hybrid_ai_service import hybrid_ai_service
        hybrid_ai_available = True
    except ImportError as e:
        print(f"Hybrid AI service import failed: {e}")
        hybrid_ai_available = False
    
    # Import AI models
    try:
        from hybrid_ai_service import AIRequest, AIResponse
    except ImportError:
        # Fallback definitions if not available
        AIRequest = None
        AIResponse = None
    print("✅ Enhanced AI service imported successfully")
except ImportError as e:
    print(f"❌ Enhanced AI service import failed: {e}")
    enhanced_ai_service = None

# Import new services
from telephony_service import (
    telephony_service,
    whatsapp_service, 
    hrms_service,
    CallRequest,
    CallLog,
    WhatsAppMessage,
    Employee,
    Attendance,
    LeaveRequest
)

# Import Aavana 2.0 Orchestrator
from aavana_2_0_orchestrator import (
    aavana_2_0,
    ConversationRequest,
    ConversationResponse,
    SupportedLanguage,
    ChannelType,
    IntentType
)

# Import Multi-AI Coordinator
from multi_ai_coordinator import (
    multi_ai_coordinator,
    process_ai_request,
    get_ai_system_status,
    initialize_ai_system
)

# Import Specialized AI Agents System
from specialized_ai_agents import (
    specialized_agent_router,
    process_specialized_request,
    get_specialized_agent_status,
    initialize_specialized_agents
)

# Import Targets Service
from targets_service import (
    get_targets_service,
    Target,
    ProgressUpdate,
    ProgressSummary,
    ReminderSettings,
    TargetPeriod,
    TargetType,
    UserRole
)

from erp_service import (
    erp_service,
    hrms_service as complete_hrms_service,
    analytics_service,
    Product,
    ProductCreate,
    Invoice,
    ProjectGallery,
    Appointment,
    InventoryAlert
)

from calendar_service import (
    calendar_service,
    whatsapp_advanced_service,
    CalendarEvent,
    CalendarEventCreate,
    SMSNotification,
    EmailNotification
)

# Import new services
from file_upload_service import file_upload_service
from role_management_service import initialize_role_management_service, role_management_service
from lead_management_service import initialize_lead_management_service, lead_management_service
from voice_stt_service import initialize_voice_stt_service, voice_stt_service
from offline_sync_service import initialize_offline_sync_service, offline_sync_service
from lead_routing_service import initialize_lead_routing_service
from workflow_authoring_service import initialize_workflow_authoring_service
from background_services import background_service, run_background_services

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Email Configuration
email_conf = ConnectionConfig(
    MAIL_USERNAME=os.environ.get('MAIL_USERNAME', 'noreply@aavanagreens.com'),
    MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD', 'demo_password'),
    MAIL_FROM=os.environ.get('MAIL_FROM', 'noreply@aavanagreens.com'),
    MAIL_PORT=int(os.environ.get('MAIL_PORT', '587')),
    MAIL_SERVER=os.environ.get('MAIL_SERVER', 'smtp.gmail.com'),
    MAIL_FROM_NAME=os.environ.get('MAIL_FROM_NAME', 'Aavana Greens CRM'),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fastmail = FastMail(email_conf)

# Initialize services
targets = get_targets_service(db)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ... (rest of the very long file content remains unchanged up to notifications scaffold)

# ------------------------
# Marketing persistence helpers and list endpoints
# ------------------------
class PersistResult(BaseModel):
    id: str
    coll: str

async def _persist(coll_name: str, payload: dict) -> PersistResult:
    try:
        doc = dict(payload)
        if 'id' not in doc:
            doc['id'] = str(uuid.uuid4())
        if 'created_at' not in doc:
            doc['created_at'] = datetime.now(timezone.utc)
        await db[coll_name].insert_one(make_json_safe(doc))
        return PersistResult(id=doc['id'], coll=coll_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB persist failed: {e}")

@api_router.get("/marketing/reels")
async def list_marketing_reels(limit: int = 50):
    items = await db.marketing_reels.find({}).sort("created_at", -1).limit(limit).to_list(length=limit)
    return [parse_from_mongo(i) for i in items]

@api_router.get("/marketing/ugc")
async def list_marketing_ugc(limit: int = 50):
    items = await db.marketing_ugc.find({}).sort("created_at", -1).limit(limit).to_list(length=limit)
    return [parse_from_mongo(i) for i in items]

@api_router.get("/marketing/influencers")
async def list_marketing_influencers(limit: int = 50):
    items = await db.marketing_influencers.find({}).sort("created_at", -1).limit(limit).to_list(length=limit)
    return [parse_from_mongo(i) for i in items]

@api_router.get("/marketing/brand-assets")
async def list_marketing_brand_assets(limit: int = 50):
    items = await db.marketing_brand_assets.find({}).sort("created_at", -1).limit(limit).to_list(length=limit)
    return [parse_from_mongo(i) for i in items]

@api_router.get("/marketing/approvals")
async def list_marketing_approvals(limit: int = 100):
    items = await db.marketing_approvals.find({}).sort("created_at", -1).limit(limit).to_list(length=limit)
    return [parse_from_mongo(i) for i in items]

# ------------------------
# Notifications (Web Push)
# ------------------------
@api_router.get("/notifications/public-key")
async def get_vapid_public_key():
    key = os.environ.get("VAPID_PUBLIC_KEY")
    if not key:
        raise HTTPException(status_code=404, detail="VAPID public key not configured")
    return {"publicKey": key}

@api_router.post("/notifications/subscribe")
async def subscribe_web_push(payload: dict):
    try:
        sub = dict(payload or {})
        sub_id = sub.get("id") or str(uuid.uuid4())
        sub["id"] = sub_id
        sub["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.web_push_subscriptions.update_one({"id": sub_id}, {"$set": make_json_safe(sub)}, upsert=True)
        return {"success": True, "subscription_id": sub_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subscription failed: {e}")

@api_router.post("/notifications/test")
async def test_notification(payload: dict):
    try:
        note = {
            "id": str(uuid.uuid4()),
            "title": payload.get("title", "Test Notification"),
            "body": payload.get("body", "Hello from Aavana"),
            "target": payload.get("subscription_id"),
            "queued_at": datetime.now(timezone.utc).isoformat(),
            "status": "queued_local"
        }
        await db.notifications.insert_one(note)
        return {"success": True, "queued": True, "id": note["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Notify failed: {e}")

@api_router.post("/notifications/push")
async def send_push(payload: dict):
    try:
        sub_id = payload.get("subscription_id")
        if not sub_id:
            raise HTTPException(status_code=400, detail="subscription_id required")
        sub = await db.web_push_subscriptions.find_one({"id": sub_id})
        if not sub:
            raise HTTPException(status_code=404, detail="subscription not found")
        public_key = os.environ.get("VAPID_PUBLIC_KEY")
        private_key = os.environ.get("VAPID_PRIVATE_KEY")
        if not (public_key and private_key):
            raise HTTPException(status_code=400, detail="VAPID keys not configured")
        endpoint = sub.get("endpoint")
        keys = sub.get("keys") or {}
        subscription_info = {"endpoint": endpoint, "keys": keys}
        data = {
            "title": payload.get("title", "Aavana Notification"),
            "body": payload.get("body", "Hello"),
            "url": payload.get("url", "/")
        }
        try:
            webpush(
                subscription_info,
                json.dumps(data),
                vapid_private_key=private_key,
                vapid_claims={"sub": "mailto:admin@aavana.local"}
            )
        except WebPushException as e:
            raise HTTPException(status_code=500, detail=f"Web push failed: {e}")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Push error: {e}")

# ------------------------
# WhatsApp (Meta/360dialog adapter scaffolding)
# ------------------------
@api_router.get("/whatsapp/webhook")
async def whatsapp_verify(mode: str = "", challenge: str = "", verify_token: str = "", hub_mode: str = "", hub_challenge: str = "", hub_verify_token: str = ""):
    token = os.environ.get("WHATSAPP_VERIFY_TOKEN")
    mode = hub_mode or mode
    challenge = hub_challenge or challenge
    incoming_token = hub_verify_token or verify_token
    if token and incoming_token == token and mode == "subscribe":
        return JSONResponse(status_code=200, content=challenge)
    raise HTTPException(status_code=403, detail="Verification failed")

@api_router.post("/whatsapp/webhook")
async def whatsapp_webhook(payload: dict):
    try:
        event = {
            "id": str(uuid.uuid4()),
            "provider": os.environ.get("WHATSAPP_PROVIDER", "unknown"),
            "raw": payload,
            "received_at": datetime.now(timezone.utc).isoformat()
        }
        await db.whatsapp_messages.insert_one(make_json_safe(event))
        text = None
        phone = None
        try:
            entry = (payload.get("entry") or [{}])[0]
            changes = (entry.get("changes") or [{}])[0]
            value = changes.get("value", {})
            messages = value.get("messages", [])
            if messages:
                msg = messages[0]
                text = msg.get("text", {}).get("body") or msg.get("button", {}).get("text")
                phone = msg.get("from")
        except Exception:
            pass
        if text:
            try:
                task_prompt = f"Convert this WhatsApp message into a task with title, description, and due hints: {text}"
                ai_text = await ai_service.orchestrator.route_task("quick_response", task_prompt)
            except Exception:
                ai_text = None
            task = {
                "id": str(uuid.uuid4()),
                "title": (ai_text or text)[:64],
                "description": ai_text or text,
                "status": "Pending",
                "priority": "Medium",
                "channel": "whatsapp",
                "contact_phone": phone,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "ai_generated": True
            }
            await db.tasks.insert_one(make_json_safe(task))
            return {"success": True, "task_id": task["id"]}
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook error: {e}")

@api_router.get("/whatsapp/messages")
async def list_whatsapp_messages(limit: int = 50):
    items = await db.whatsapp_messages.find({}).sort("received_at", -1).limit(limit).to_list(length=limit)
    return [parse_from_mongo(i) for i in items]

@api_router.post("/whatsapp/send")
async def whatsapp_send_stub(payload: dict):
    try:
        msg = {
            "id": str(uuid.uuid4()),
            "to": payload.get("to"),
            "template": payload.get("template"),
            "text": payload.get("text"),
            "status": "queued",
            "provider": os.environ.get("WHATSAPP_PROVIDER", "staged"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.whatsapp_messages.insert_one(make_json_safe(msg))
        return {"success": True, "queued": True, "id": msg["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Send failed: {e}")

# ------------------------
# Unified Calendar (internal)
# ------------------------
@api_router.post("/calendar/events")
async def create_calendar_event(event: dict):
    try:
        ev = dict(event or {})
        ev["id"] = ev.get("id") or str(uuid.uuid4())
        ev["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.calendar_events.insert_one(make_json_safe(ev))
        return {"success": True, "event_id": ev["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Create event failed: {e}")

@api_router.get("/calendar/events")
async def list_calendar_events(linkTo: Optional[str] = None, refId: Optional[str] = None, limit: int = 100):
    try:
        q = {}
        if linkTo and refId:
            q["linkTo"] = linkTo
            q["refId"] = refId
        items = await db.calendar_events.find(q).sort("start", 1).limit(limit).to_list(length=limit)
        return [parse_from_mongo(i) for i in items]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"List events failed: {e}")

@api_router.post("/calendar/events/{event_id}/remind-now")
async def remind_now(event_id: str):
    try:
        ev = await db.calendar_events.find_one({"id": event_id})
        if not ev:
            raise HTTPException(status_code=404, detail="Event not found")
        note = {
            "id": str(uuid.uuid4()),
            "event_id": event_id,
            "type": "calendar_reminder",
            "queued_at": datetime.now(timezone.utc).isoformat(),
            "status": "queued_local"
        }
        await db.notifications.insert_one(note)
        try:
            client_phone = ev.get("client", {}).get("phone")
            if client_phone:
                await db.whatsapp_messages.insert_one(make_json_safe({
                    "id": str(uuid.uuid4()),
                    "to": client_phone,
                    "text": f"Reminder: {ev.get('title','Meeting')} at {ev.get('start')}",
                    "status": "queued",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }))
        except Exception:
            pass
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Remind failed: {e}")

# ... (rest of the original routes remain unchanged)

# Include the router in the main app at the very end (kept in original file)