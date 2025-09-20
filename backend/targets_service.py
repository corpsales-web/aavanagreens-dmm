"""
TARGETS & PROGRESS TRACKING SERVICE
===================================

Features:
- Daily/Weekly/Monthly targets for sales, leads, tasks
- Real-time progress tracking
- Auto-sync with Pipedrive deals
- Multilingual reminders via Aavana 2.0
- WhatsApp notifications via 360dialog
- Role-based access control (RBAC)
- Serverless scheduler integration
"""

from fastapi import HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from enum import Enum
import json
import uuid

class TargetPeriod(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class TargetType(str, Enum):
    SALES_AMOUNT = "sales_amount"
    LEADS_COUNT = "leads_count"
    TASKS_COUNT = "tasks_count"

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    SALES_MANAGER = "sales_manager"
    SALES_REP = "sales_rep"
    INSIDE_SALES = "inside_sales"
    DESIGNER = "designer"

class Target(BaseModel):
    """Target model for sales, leads, tasks"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    team_id: Optional[str] = None
    target_type: TargetType
    period: TargetPeriod
    target_value: float
    current_value: float = 0.0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    notes: Optional[str] = None

class ProgressUpdate(BaseModel):
    """Progress update for targets"""
    target_id: str
    increment_value: float
    source: str  # "pipedrive", "manual", "lead_conversion", "task_completion"
    reference_id: Optional[str] = None  # Deal ID, Lead ID, Task ID
    notes: Optional[str] = None
    updated_by: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProgressSummary(BaseModel):
    """Progress summary for dashboard"""
    user_id: str
    period: TargetPeriod
    sales_target: float = 0.0
    sales_achieved: float = 0.0
    sales_progress_percent: float = 0.0
    leads_target: int = 0
    leads_achieved: int = 0
    leads_progress_percent: float = 0.0
    tasks_target: int = 0
    tasks_achieved: int = 0
    tasks_progress_percent: float = 0.0
    remaining_days: int = 0
    is_on_track: bool = False
    performance_rating: str = "needs_attention"  # excellent, good, average, needs_attention

class ReminderSettings(BaseModel):
    """Reminder settings for targets"""
    user_id: str
    enable_daily_reminders: bool = True
    enable_weekly_reminders: bool = True
    enable_milestone_alerts: bool = True
    preferred_language: str = "en"  # en, hi, hi-en
    whatsapp_notifications: bool = True
    in_app_notifications: bool = True
    reminder_time: str = "09:00"  # HH:MM format

class TargetsService:
    """Service for managing targets and progress tracking"""
    
    def __init__(self, db):
        self.db = db
        
    async def create_target(self, target: Target) -> Dict[str, Any]:
        """Create a new target"""
        try:
            # Validate role permissions
            if not await self._has_permission(target.created_by, "create_targets"):
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            
            # Calculate period dates if not provided
            if not target.start_date or not target.end_date:
                target.start_date, target.end_date = self._calculate_period_dates(target.period)
            
            # Store in database
            target_dict = target.dict()
            target_dict['start_date'] = target.start_date.isoformat()
            target_dict['end_date'] = target.end_date.isoformat()  
            target_dict['created_at'] = target.created_at.isoformat()
            target_dict['updated_at'] = target.updated_at.isoformat()
            
            await self.db.targets.insert_one(target_dict)
            
            return {
                "success": True,
                "target_id": target.id,
                "message": "Target created successfully",
                "period": f"{target.period.value}",
                "target_value": target.target_value
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create target: {str(e)}")
    
    async def update_progress(self, progress: ProgressUpdate) -> Dict[str, Any]:
        """Update target progress"""
        try:
            # Get target
            target = await self.db.targets.find_one({"id": progress.target_id})
            if not target:
                raise HTTPException(status_code=404, detail="Target not found")
            
            # Update progress with idempotency check
            update_id = f"{progress.target_id}_{progress.source}_{progress.reference_id}"
            existing_update = await self.db.progress_updates.find_one({"update_id": update_id})
            
            if existing_update:
                return {"success": True, "message": "Progress already updated", "duplicate": True}
            
            # Store progress update
            progress_dict = progress.dict()
            progress_dict['update_id'] = update_id
            progress_dict['timestamp'] = progress.timestamp.isoformat()
            
            await self.db.progress_updates.insert_one(progress_dict)
            
            # Update target current value
            new_value = target['current_value'] + progress.increment_value
            await self.db.targets.update_one(
                {"id": progress.target_id},
                {
                    "$set": {
                        "current_value": new_value,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # Check if milestone reached
            progress_percent = (new_value / target['target_value']) * 100
            await self._check_milestones(target, progress_percent)
            
            return {
                "success": True,
                "new_value": new_value,
                "progress_percent": round(progress_percent, 2),
                "target_value": target['target_value']
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")
    
    async def get_progress_summary(self, user_id: str, period: TargetPeriod) -> ProgressSummary:
        """Get comprehensive progress summary"""
        try:
            # Get current targets for user and period
            start_date, end_date = self._calculate_period_dates(period)
            
            targets = await self.db.targets.find({
                "user_id": user_id,
                "period": period.value,
                "is_active": True,
                "start_date": {"$lte": end_date.isoformat()},
                "end_date": {"$gte": start_date.isoformat()}
            }).to_list(length=10)
            
            summary = ProgressSummary(user_id=user_id, period=period)
            
            for target in targets:
                target_type = target['target_type']
                target_value = target['target_value']
                current_value = target['current_value']
                progress_percent = (current_value / target_value * 100) if target_value > 0 else 0
                
                if target_type == TargetType.SALES_AMOUNT.value:
                    summary.sales_target = target_value
                    summary.sales_achieved = current_value
                    summary.sales_progress_percent = round(progress_percent, 2)
                elif target_type == TargetType.LEADS_COUNT.value:
                    summary.leads_target = int(target_value)
                    summary.leads_achieved = int(current_value)
                    summary.leads_progress_percent = round(progress_percent, 2)
                elif target_type == TargetType.TASKS_COUNT.value:
                    summary.tasks_target = int(target_value)
                    summary.tasks_achieved = int(current_value)
                    summary.tasks_progress_percent = round(progress_percent, 2)
            
            # Calculate remaining days
            summary.remaining_days = (end_date - datetime.now(timezone.utc)).days
            
            # Determine performance rating
            avg_progress = (summary.sales_progress_percent + summary.leads_progress_percent + summary.tasks_progress_percent) / 3
            
            if avg_progress >= 90:
                summary.performance_rating = "excellent"
                summary.is_on_track = True
            elif avg_progress >= 70:
                summary.performance_rating = "good"
                summary.is_on_track = True
            elif avg_progress >= 50:
                summary.performance_rating = "average"
                summary.is_on_track = False
            else:
                summary.performance_rating = "needs_attention"
                summary.is_on_track = False
            
            return summary
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get progress summary: {str(e)}")
    
    async def sync_pipedrive_deals(self, user_id: str) -> Dict[str, Any]:
        """Sync closed deals from Pipedrive to update sales targets"""
        try:
            # In Phase 1, we'll simulate Pipedrive sync
            # In production, this would call actual Pipedrive API
            
            # Get recent "Won" deals from internal database
            recent_deals = await self.db.leads.find({
                "assigned_to": user_id,
                "status": "Won",
                "updated_at": {"$gte": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()}
            }).to_list(length=20)
            
            total_deal_value = 0
            deals_processed = 0
            
            for deal in recent_deals:
                deal_value = float(deal.get('budget', 0) or 0)
                if deal_value > 0:
                    # Update sales target progress
                    await self._update_sales_progress(user_id, deal_value, deal['id'])
                    total_deal_value += deal_value
                    deals_processed += 1
            
            return {
                "success": True,
                "deals_processed": deals_processed,
                "total_value_synced": total_deal_value,
                "message": f"Synced {deals_processed} deals worth ₹{total_deal_value}"
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Pipedrive sync failed: {str(e)}")
    
    async def send_reminders(self, user_id: str = None) -> Dict[str, Any]:
        """Send progress reminders via Aavana 2.0 and WhatsApp"""
        try:
            # Get users who need reminders
            if user_id:
                users = [{"user_id": user_id}]
            else:
                # Get all users with active targets
                users = await self.db.targets.aggregate([
                    {"$match": {"is_active": True}},
                    {"$group": {"_id": "$user_id"}},
                    {"$project": {"user_id": "$_id"}}
                ]).to_list(length=100)
            
            reminders_sent = 0
            
            for user in users:
                user_id = user['user_id']
                
                # Get reminder settings
                settings = await self.db.reminder_settings.find_one({"user_id": user_id})
                if not settings or not settings.get('enable_daily_reminders', True):
                    continue
                
                # Get progress summary
                daily_progress = await self.get_progress_summary(user_id, TargetPeriod.DAILY)
                weekly_progress = await self.get_progress_summary(user_id, TargetPeriod.WEEKLY)
                
                # Generate multilingual reminder message
                language = settings.get('preferred_language', 'en')
                reminder_message = await self._generate_reminder_message(daily_progress, weekly_progress, language)
                
                # Send via Aavana 2.0 (in-app notification)
                if settings.get('in_app_notifications', True):
                    await self._send_aavana_reminder(user_id, reminder_message, language)
                
                # Send via WhatsApp (360dialog)
                if settings.get('whatsapp_notifications', True):
                    await self._send_whatsapp_reminder(user_id, reminder_message)
                
                reminders_sent += 1
            
            return {
                "success": True,
                "reminders_sent": reminders_sent,
                "message": f"Sent reminders to {reminders_sent} users"
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send reminders: {str(e)}")
    
    def _calculate_period_dates(self, period: TargetPeriod) -> tuple[datetime, datetime]:
        """Calculate start and end dates for target period"""
        now = datetime.now(timezone.utc)
        
        if period == TargetPeriod.DAILY:
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = start_date + timedelta(days=1) - timedelta(microseconds=1)
        elif period == TargetPeriod.WEEKLY:
            # Week starts on Monday
            days_since_monday = now.weekday()
            start_date = (now - timedelta(days=days_since_monday)).replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = start_date + timedelta(days=7) - timedelta(microseconds=1)
        else:  # MONTHLY
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            # Next month's first day minus 1 microsecond
            if now.month == 12:
                next_month = now.replace(year=now.year + 1, month=1, day=1)
            else:
                next_month = now.replace(month=now.month + 1, day=1)
            end_date = next_month - timedelta(microseconds=1)
        
        return start_date, end_date
    
    async def _has_permission(self, user_id: str, action: str) -> bool:
        """Check if user has permission for action"""
        # Simplified RBAC - in production, check actual user roles
        return True  # For Phase 1, allow all users
    
    async def _check_milestones(self, target: Dict, progress_percent: float):
        """Check if milestone reached and trigger notifications"""
        milestones = [25, 50, 75, 90, 100]
        
        for milestone in milestones:
            if progress_percent >= milestone:
                # Check if milestone notification already sent
                notification_id = f"{target['id']}_milestone_{milestone}"
                existing = await self.db.milestone_notifications.find_one({"notification_id": notification_id})
                
                if not existing:
                    # Send milestone notification
                    await self._send_milestone_notification(target, milestone)
                    
                    # Record notification sent
                    await self.db.milestone_notifications.insert_one({
                        "notification_id": notification_id,
                        "target_id": target['id'],
                        "user_id": target['user_id'],
                        "milestone": milestone,
                        "sent_at": datetime.now(timezone.utc).isoformat()
                    })
    
    async def _update_sales_progress(self, user_id: str, deal_value: float, deal_id: str):
        """Update sales progress from deal closure"""
        # Find active daily, weekly, monthly sales targets
        periods = [TargetPeriod.DAILY, TargetPeriod.WEEKLY, TargetPeriod.MONTHLY]
        
        for period in periods:
            start_date, end_date = self._calculate_period_dates(period)
            
            target = await self.db.targets.find_one({
                "user_id": user_id,
                "target_type": TargetType.SALES_AMOUNT.value,
                "period": period.value,
                "is_active": True,
                "start_date": {"$lte": end_date.isoformat()},
                "end_date": {"$gte": start_date.isoformat()}
            })
            
            if target:
                progress = ProgressUpdate(
                    target_id=target['id'],
                    increment_value=deal_value,
                    source="deal_closure",
                    reference_id=deal_id,
                    updated_by=user_id,
                    notes=f"Deal closed: ₹{deal_value}"
                )
                await self.update_progress(progress)
    
    async def _generate_reminder_message(self, daily_progress: ProgressSummary, weekly_progress: ProgressSummary, language: str) -> str:
        """Generate multilingual reminder message"""
        
        if language == "hi":
            return f"""
🎯 आज का लक्ष्य अपडेट:
💰 बिक्री: ₹{daily_progress.sales_achieved}/{daily_progress.sales_target} ({daily_progress.sales_progress_percent}%)
👥 लीड्स: {daily_progress.leads_achieved}/{daily_progress.leads_target} ({daily_progress.leads_progress_percent}%)
✅ कार्य: {daily_progress.tasks_achieved}/{daily_progress.tasks_target} ({daily_progress.tasks_progress_percent}%)

📅 साप्ताहिक प्रगति: {weekly_progress.sales_progress_percent}%
⏰ बचे हुए दिन: {daily_progress.remaining_days}

💪 आज भी मेहनत करते रहें! Aavana Greens टीम आपके साथ है।
            """
        elif language == "hi-en":
            return f"""
🎯 Aaj ka Target Update:
💰 Sales: ₹{daily_progress.sales_achieved}/{daily_progress.sales_target} ({daily_progress.sales_progress_percent}%)
👥 Leads: {daily_progress.leads_achieved}/{daily_progress.leads_target} ({daily_progress.leads_progress_percent}%)
✅ Tasks: {daily_progress.tasks_achieved}/{daily_progress.tasks_target} ({daily_progress.tasks_progress_percent}%)

📅 Weekly Progress: {weekly_progress.sales_progress_percent}%
⏰ Days Remaining: {daily_progress.remaining_days}

💪 Keep pushing! Aavana Greens team tumhare saath hai!
            """
        else:  # English
            return f"""
🎯 Daily Target Update:
💰 Sales: ₹{daily_progress.sales_achieved}/{daily_progress.sales_target} ({daily_progress.sales_progress_percent}%)
👥 Leads: {daily_progress.leads_achieved}/{daily_progress.leads_target} ({daily_progress.leads_progress_percent}%)
✅ Tasks: {daily_progress.tasks_achieved}/{daily_progress.tasks_target} ({daily_progress.tasks_progress_percent}%)

📅 Weekly Progress: {weekly_progress.sales_progress_percent}%
⏰ Days Remaining: {daily_progress.remaining_days}

💪 Keep up the great work! Aavana Greens team is with you.
            """
    
    async def _send_aavana_reminder(self, user_id: str, message: str, language: str):
        """Send reminder via Aavana 2.0"""
        # This would integrate with Aavana 2.0 notification system
        # For Phase 1, we'll store in notifications collection
        await self.db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "target_reminder",
            "message": message,
            "language": language,
            "channel": "aavana_2_0",
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "read": False
        })
    
    async def _send_whatsapp_reminder(self, user_id: str, message: str):
        """Send reminder via WhatsApp (360dialog)"""
        # This would integrate with 360dialog API
        # For Phase 1, we'll store the intended message
        await self.db.whatsapp_reminders.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "message": message,
            "channel": "whatsapp",
            "status": "queued",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    async def _send_milestone_notification(self, target: Dict, milestone: int):
        """Send milestone achievement notification"""
        user_id = target['user_id']
        target_type = target['target_type']
        
        message = f"""
🎉 Milestone Achieved!
You've reached {milestone}% of your {target_type.replace('_', ' ')} target!
Current: {target['current_value']} / Target: {target['target_value']}

Keep up the excellent work! 💪
        """
        
        await self._send_aavana_reminder(user_id, message, "en")

# Global targets service instance
targets_service = None

def get_targets_service(db):
    global targets_service
    if targets_service is None:
        targets_service = TargetsService(db)
    return targets_service