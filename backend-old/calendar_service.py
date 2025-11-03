from fastapi import HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import json
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

# Calendar Integration Models
class CalendarEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    attendees: List[str] = []
    event_type: str = "Meeting"  # Meeting, Site Visit, Consultation, Follow-up
    lead_id: Optional[str] = None
    task_id: Optional[str] = None
    google_event_id: Optional[str] = None
    reminder_minutes: int = 30
    status: str = "Scheduled"  # Scheduled, Confirmed, Completed, Cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    attendees: List[str] = []
    event_type: str = "Meeting"
    lead_id: Optional[str] = None
    task_id: Optional[str] = None
    reminder_minutes: int = 30

class SMSNotification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    recipient_phone: str
    message: str
    message_type: str  # Reminder, Confirmation, Follow-up, Marketing
    scheduled_time: Optional[datetime] = None
    sent_time: Optional[datetime] = None
    status: str = "Pending"  # Pending, Sent, Failed, Delivered
    event_id: Optional[str] = None
    lead_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmailNotification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    recipient_email: str
    subject: str
    body: str
    email_type: str  # Reminder, Proposal, Invoice, Newsletter
    scheduled_time: Optional[datetime] = None
    sent_time: Optional[datetime] = None
    status: str = "Pending"  # Pending, Sent, Failed, Delivered, Opened
    attachments: List[str] = []
    event_id: Optional[str] = None
    lead_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Calendar Service Class
class CalendarService:
    def __init__(self):
        # In production, initialize Google Calendar API client
        self.business_hours = {
            "start": "09:00",
            "end": "18:00",
            "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        }

    async def create_google_calendar_event(self, event: CalendarEvent) -> str:
        """Create event in Google Calendar and return event ID"""
        # In production, integrate with Google Calendar API
        google_event = {
            "summary": event.title,
            "description": event.description,
            "start": {
                "dateTime": event.start_time.isoformat(),
                "timeZone": "Asia/Kolkata"
            },
            "end": {
                "dateTime": event.end_time.isoformat(),
                "timeZone": "Asia/Kolkata"
            },
            "location": event.location,
            "attendees": [{"email": attendee} for attendee in event.attendees],
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "email", "minutes": event.reminder_minutes},
                    {"method": "popup", "minutes": event.reminder_minutes}
                ]
            }
        }
        
        # Simulate Google Calendar API response
        google_event_id = f"gcal_{uuid.uuid4().hex[:8]}"
        return google_event_id

    async def generate_booking_link(self, duration_minutes: int = 60) -> str:
        """Generate booking link for clients"""
        booking_id = uuid.uuid4().hex[:8]
        return f"https://aavana-greens.com/book/{booking_id}?duration={duration_minutes}"

    async def check_availability(self, date: datetime, duration_minutes: int) -> List[Dict[str, Any]]:
        """Check availability for a specific date"""
        # Generate available time slots
        available_slots = []
        start_hour = 9  # 9 AM
        end_hour = 18   # 6 PM
        slot_duration = duration_minutes // 60  # Convert to hours
        
        current_time = date.replace(hour=start_hour, minute=0, second=0, microsecond=0)
        
        while current_time.hour + slot_duration <= end_hour:
            end_time = current_time + timedelta(hours=slot_duration)
            available_slots.append({
                "start_time": current_time.isoformat(),
                "end_time": end_time.isoformat(),
                "available": True  # In production, check against existing bookings
            })
            current_time += timedelta(hours=1)
        
        return available_slots

    async def send_appointment_reminder(self, event: CalendarEvent, reminder_type: str = "sms") -> Dict[str, Any]:
        """Send appointment reminder"""
        if reminder_type == "sms":
            message = f"Reminder: Your appointment with Aavana Greens is scheduled for {event.start_time.strftime('%d/%m/%Y at %I:%M %p')}. Location: {event.location}. Contact: 8447475761"
            # In production, send SMS using Twilio or similar service
            return {
                "type": "sms",
                "message": message,
                "status": "sent",
                "sent_at": datetime.now(timezone.utc)
            }
        elif reminder_type == "email":
            subject = f"Appointment Reminder - {event.title}"
            body = f"""
            Dear Customer,
            
            This is a friendly reminder about your upcoming appointment with Aavana Greens.
            
            Appointment Details:
            - Date & Time: {event.start_time.strftime('%d/%m/%Y at %I:%M %p')}
            - Duration: {(event.end_time - event.start_time).total_seconds() // 60} minutes
            - Location: {event.location}
            - Type: {event.event_type}
            
            If you need to reschedule or have any questions, please contact us at 8447475761.
            
            Best regards,
            Aavana Greens Team
            """
            return {
                "type": "email",
                "subject": subject,
                "body": body,
                "status": "sent",
                "sent_at": datetime.now(timezone.utc)
            }

    async def track_site_visit_gps(self, event_id: str, gps_coordinates: str) -> Dict[str, Any]:
        """Track GPS coordinates for site visits"""
        visit_tracking = {
            "event_id": event_id,
            "gps_coordinates": gps_coordinates,
            "timestamp": datetime.now(timezone.utc),
            "status": "arrived",
            "distance_from_scheduled_location": "0.2 km"  # Calculate actual distance
        }
        return visit_tracking

# WhatsApp Advanced Service
class AdvancedWhatsAppService:
    def __init__(self):
        self.business_number = "918447475761"
        
    async def send_catalog_message(self, to_number: str) -> Dict[str, Any]:
        """Send interactive catalog message"""
        catalog_message = {
            "to": to_number,
            "type": "interactive",
            "interactive": {
                "type": "product_list",
                "header": {
                    "type": "text",
                    "text": "🌿 Aavana Greens Product Catalog"
                },
                "body": {
                    "text": "Discover our amazing collection of plants and garden solutions!"
                },
                "footer": {
                    "text": "Swipe to explore categories"
                },
                "action": {
                    "catalog_id": "aavana_catalog_2024",
                    "sections": [
                        {
                            "title": "Indoor Plants",
                            "product_items": [
                                {"product_retailer_id": "monstera_001"},
                                {"product_retailer_id": "snake_plant_002"}
                            ]
                        },
                        {
                            "title": "Garden Tools",
                            "product_items": [
                                {"product_retailer_id": "tool_kit_001"},
                                {"product_retailer_id": "watering_can_002"}
                            ]
                        }
                    ]
                }
            }
        }
        return catalog_message

    async def process_ai_chatbot_response(self, incoming_message: str, customer_data: Dict) -> Dict[str, Any]:
        """Process message with AI chatbot using customer context"""
        message_lower = incoming_message.lower()
        
        # AI-powered intent detection
        intents = {
            "price_inquiry": ["price", "cost", "budget", "expensive", "cheap", "rate"],
            "product_inquiry": ["plants", "tools", "fertilizer", "garden", "catalog"],
            "appointment_booking": ["visit", "appointment", "consultation", "meet", "schedule"],
            "complaint": ["problem", "issue", "complaint", "not working", "defective"],
            "support": ["help", "support", "assistance", "question", "doubt"]
        }
        
        detected_intent = "general"
        for intent, keywords in intents.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_intent = intent
                break
        
        # Generate contextual response
        responses = {
            "price_inquiry": f"Hi {customer_data.get('name', 'there')}! Our prices vary based on your requirements. For a personalized quote, I'd love to understand your space better. Could you share the size of your area and what you're looking to achieve?",
            
            "product_inquiry": "🌱 Great question! We have an extensive collection. Let me share our catalog with you. Which category interests you most: Indoor Plants, Outdoor Plants, Garden Tools, or Complete Garden Setup?",
            
            "appointment_booking": f"Perfect! I'd be happy to schedule a consultation for you. When would be convenient? We're available Monday-Saturday, 9 AM to 6 PM. Our expert will visit your location for a detailed discussion.",
            
            "complaint": f"I sincerely apologize for any inconvenience, {customer_data.get('name', 'sir/madam')}. Your satisfaction is our priority. Let me connect you with our senior team member who will resolve this immediately. Meanwhile, could you share more details about the issue?",
            
            "support": "I'm here to help! 😊 You can ask me about our plants, services, pricing, or book a consultation. For immediate assistance, you can also call us at 8447475761. What would you like to know?",
            
            "general": "Thank you for reaching out to Aavana Greens! 🌿 We're your trusted partner for all green solutions - from beautiful plant collections to complete garden transformations. How can I assist you today?"
        }
        
        response = responses.get(detected_intent, responses["general"])
        
        # Add quick reply buttons based on intent
        quick_replies = []
        if detected_intent == "product_inquiry":
            quick_replies = ["View Catalog", "Indoor Plants", "Outdoor Plants", "Book Consultation"]
        elif detected_intent == "price_inquiry":
            quick_replies = ["Get Quote", "View Packages", "Schedule Visit", "Call Now"]
        elif detected_intent == "appointment_booking":
            quick_replies = ["Today", "Tomorrow", "This Weekend", "Next Week"]
        
        return {
            "response_text": response,
            "intent": detected_intent,
            "quick_replies": quick_replies,
            "confidence": 0.85,
            "follow_up_action": self._get_follow_up_action(detected_intent),
            "customer_context": customer_data
        }

    def _get_follow_up_action(self, intent: str) -> str:
        """Get follow-up action based on detected intent"""
        actions = {
            "price_inquiry": "schedule_callback",
            "product_inquiry": "send_catalog", 
            "appointment_booking": "create_appointment",
            "complaint": "escalate_to_manager",
            "support": "offer_assistance"
        }
        return actions.get(intent, "continue_conversation")

    async def send_smart_suggestion(self, customer_phone: str, interaction_history: List[Dict]) -> Dict[str, Any]:
        """Send smart suggestions based on interaction history"""
        # Analyze customer behavior and send relevant suggestions
        suggestions = {
            "frequent_inquirer": "Since you've been exploring our services, here's a special 10% discount for your first garden setup! Valid till month end. 🎉",
            "appointment_no_show": "We missed you at our scheduled appointment. No worries! Would you like to reschedule? We're offering a complimentary plant care guide with your consultation. 🌱",
            "repeat_customer": "Welcome back! Based on your previous purchase, you might love our new seasonal collection. Plus, enjoy priority support as our valued customer! ⭐",
            "price_sensitive": "We understand budget is important. Check out our affordable starter packages - beautiful gardens starting from just ₹5,000! Perfect for beginners. 💚"
        }
        
        # In production, use ML to determine customer segment
        customer_segment = "frequent_inquirer"  # Simulated
        
        return {
            "suggestion": suggestions.get(customer_segment, suggestions["frequent_inquirer"]),
            "segment": customer_segment,
            "personalization_score": 0.92
        }

# Global service instances
calendar_service = CalendarService()
whatsapp_advanced_service = AdvancedWhatsAppService()