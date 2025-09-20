from fastapi import HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import json
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

# Twilio Integration Models
class CallRequest(BaseModel):
    to_number: str
    from_number: str = "8447475761"  # Aavana Greens business number
    message: Optional[str] = None
    lead_id: Optional[str] = None

class CallLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    call_sid: Optional[str] = None
    from_number: str
    to_number: str
    status: str
    duration: Optional[int] = None
    direction: str  # inbound/outbound
    recording_url: Optional[str] = None
    notes: Optional[str] = None
    lead_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IVRResponse(BaseModel):
    message: str
    options: Dict[str, str]
    next_action: str

# WhatsApp Business Integration Models  
class WhatsAppMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_number: str
    to_number: str
    message_type: str  # text, image, document, template
    content: str
    status: str  # sent, delivered, read, failed
    lead_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WhatsAppTemplate(BaseModel):
    name: str
    category: str  # marketing, utility, authentication
    content: str
    variables: List[str] = []

# HRMS Models
class Employee(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    employee_id: str
    email: str
    phone: str
    department: str  # Sales, Design, Operations, Admin
    role: str  # Manager, Executive, Assistant
    salary: Optional[float] = None
    join_date: datetime
    status: str = "Active"  # Active, Inactive, On Leave
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Attendance(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    date: datetime
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    location: Optional[str] = None  # GPS coordinates
    status: str = "Present"  # Present, Absent, Half Day, Late
    hours_worked: Optional[float] = None
    notes: Optional[str] = None

class LeaveRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    leave_type: str  # Casual, Sick, Annual, Emergency
    start_date: datetime
    end_date: datetime
    days_count: int
    reason: str
    status: str = "Pending"  # Pending, Approved, Rejected
    approved_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Telephony Service Class
class TelephonyService:
    def __init__(self):
        self.business_number = "8447475761"
        # In production, initialize Twilio client here
        # self.twilio_client = Client(account_sid, auth_token)
    
    async def create_ivr_response(self, digit_pressed: str) -> IVRResponse:
        """Handle IVR menu responses"""
        ivr_menu = {
            "1": {
                "message": "You've reached Aavana Greens Sales Department. Please hold while we connect you to our green building expert.",
                "next_action": "transfer_to_sales"
            },
            "2": {
                "message": "You've reached Aavana Greens Design Department. Our landscape designers will help you create your dream green space.",
                "next_action": "transfer_to_design"
            },
            "3": {
                "message": "You've reached our Plant Catalog service. You can also visit our website or nursery for our complete plant collection.",
                "next_action": "play_catalog_info"
            },
            "*": {
                "message": "Thank you for calling Aavana Greens! For Sales press 1, Design consultation press 2, Plant catalog press 3, or stay on line for operator.",
                "next_action": "main_menu"
            }
        }
        
        response = ivr_menu.get(digit_pressed, ivr_menu["*"])
        return IVRResponse(
            message=response["message"],
            options={
                "1": "Sales Department",
                "2": "Design Consultation", 
                "3": "Plant Catalog",
                "0": "Speak to Operator"
            },
            next_action=response["next_action"]
        )
    
    async def log_call(self, call_data: Dict) -> CallLog:
        """Log call details to database"""
        call_log = CallLog(**call_data)
        # In production, save to database
        return call_log
    
    async def get_call_analytics(self) -> Dict[str, Any]:
        """Get call analytics and metrics"""
        # In production, query database for call statistics
        return {
            "total_calls": 245,
            "missed_calls": 12,
            "average_duration": 180,  # seconds
            "peak_hours": ["10:00-12:00", "15:00-17:00"],
            "department_distribution": {
                "Sales": 60,
                "Design": 35,
                "Catalog": 5
            }
        }

# WhatsApp Service Class
class WhatsAppService:
    def __init__(self):
        self.business_number = "918447475761"  # WhatsApp Business number
        # In production, initialize 360Dialog client
    
    async def send_template_message(self, to_number: str, template_name: str, variables: List[str] = None) -> WhatsAppMessage:
        """Send WhatsApp template message"""
        templates = {
            "welcome": "Hello! Welcome to Aavana Greens 🌿 Your trusted partner for green building solutions and beautiful gardens. How can we help you create your green space today?",
            "catalog": "🌱 Here's our latest plant catalog! Browse through our collection of indoor plants, outdoor plants, and garden accessories. Need help choosing? Our experts are here to guide you!",
            "proposal": "Thank you for your interest in our services! We've sent you a customized proposal. Please review and let us know if you have any questions. Call us at 8447475761 for immediate assistance.",
            "appointment": "Your appointment with Aavana Greens is confirmed for {date} at {time}. Our expert will visit you for garden consultation. Address: {address}. See you soon! 🌿"
        }
        
        content = templates.get(template_name, "Thank you for contacting Aavana Greens!")
        if variables:
            content = content.format(*variables)
        
        message = WhatsAppMessage(
            from_number=self.business_number,
            to_number=to_number,
            message_type="template",
            content=content,
            status="sent"
        )
        
        return message
    
    async def process_incoming_message(self, message_data: Dict) -> Dict[str, Any]:
        """Process incoming WhatsApp message with AI chatbot"""
        content = message_data.get("content", "").lower()
        
        # Simple chatbot logic (can be enhanced with AI)
        if any(word in content for word in ["price", "cost", "budget"]):
            response = "Our services are customized based on your requirements. For a free consultation and quote, please share your space details or call us at 8447475761."
        elif any(word in content for word in ["catalog", "plants", "garden"]):
            response = "🌿 We offer a wide variety of plants and garden solutions! Would you like to see our catalog or schedule a visit to our nursery?"
        elif any(word in content for word in ["appointment", "visit", "consultation"]):
            response = "We'd love to help you create your dream garden! Please share your preferred date and time, and we'll schedule a free consultation."
        else:
            response = "Thank you for contacting Aavana Greens! 🌱 We specialize in green building solutions, landscaping, and plant nursery services. How can we help you today?"
        
        return {
            "response": response,
            "next_action": "send_response",
            "lead_qualification": self._qualify_lead(content)
        }
    
    def _qualify_lead(self, content: str) -> Dict[str, Any]:
        """Qualify lead based on message content"""
        qualification = {
            "budget_mentioned": any(word in content for word in ["budget", "cost", "price", "expensive", "cheap"]),
            "timeline_mentioned": any(word in content for word in ["urgent", "soon", "immediately", "next week", "month"]),
            "space_mentioned": any(word in content for word in ["balcony", "terrace", "garden", "office", "home", "space"]),
            "location_mentioned": any(word in content for word in ["bangalore", "mumbai", "delhi", "pune", "address"])
        }
        
        score = sum(qualification.values())
        qualification["lead_score"] = score
        qualification["priority"] = "High" if score >= 3 else "Medium" if score >= 2 else "Low"
        
        return qualification

# HRMS Service Class
class HRMSService:
    def __init__(self):
        pass
    
    async def check_in_employee(self, employee_id: str, location: str = None) -> Attendance:
        """Employee check-in with location tracking"""
        attendance = Attendance(
            employee_id=employee_id,
            date=datetime.now(timezone.utc).date(),
            check_in=datetime.now(timezone.utc),
            location=location,
            status="Present"
        )
        return attendance
    
    async def check_out_employee(self, attendance_id: str) -> Attendance:
        """Employee check-out and calculate hours"""
        # In production, fetch attendance record and update
        # Calculate hours worked
        check_out_time = datetime.now(timezone.utc)
        # hours_worked = (check_out_time - check_in_time).total_seconds() / 3600
        
        return Attendance(
            id=attendance_id,
            employee_id="emp_001",
            date=datetime.now(timezone.utc).date(),
            check_out=check_out_time,
            hours_worked=8.5,
            status="Present"
        )
    
    async def apply_leave(self, leave_data: Dict) -> LeaveRequest:
        """Submit leave application"""
        leave_request = LeaveRequest(**leave_data)
        return leave_request
    
    async def get_attendance_summary(self, employee_id: str, month: int, year: int) -> Dict[str, Any]:
        """Get monthly attendance summary"""
        # In production, query database for attendance records
        return {
            "employee_id": employee_id,
            "month": month,
            "year": year,
            "total_working_days": 22,
            "days_present": 20,
            "days_absent": 1,
            "days_leave": 1,
            "total_hours": 160,
            "average_hours_per_day": 8.0,
            "attendance_percentage": 90.9
        }

# Global service instances
telephony_service = TelephonyService()
whatsapp_service = WhatsAppService()
hrms_service = HRMSService()