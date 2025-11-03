from fastapi import HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import json
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

# ERP Models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # Plants, Tools, Fertilizers, Accessories, Services
    sku: str
    barcode: Optional[str] = None
    price: float
    cost_price: Optional[float] = None
    stock_quantity: int = 0
    min_stock_level: int = 5
    unit: str = "piece"  # piece, kg, liter, packet, set
    description: Optional[str] = None
    image_url: Optional[str] = None
    supplier: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

class ProductCreate(BaseModel):
    name: str
    category: str
    sku: str
    barcode: Optional[str] = None
    price: float
    cost_price: Optional[float] = None
    stock_quantity: int = 0
    min_stock_level: int = 5
    unit: str = "piece"
    description: Optional[str] = None
    image_url: Optional[str] = None
    supplier: Optional[str] = None

class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    customer_address: Optional[str] = None
    lead_id: Optional[str] = None
    items: List[Dict[str, Any]] = []
    subtotal: float = 0.0
    tax_percentage: float = 18.0  # GST
    tax_amount: float = 0.0
    discount_percentage: float = 0.0
    discount_amount: float = 0.0
    total_amount: float = 0.0
    payment_status: str = "Pending"  # Pending, Partial, Paid
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: Optional[datetime] = None

class ProjectGallery(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_name: str
    client_name: str
    location: str
    project_type: str  # Balcony Garden, Rooftop, Landscape, Interior
    budget_range: str
    completion_date: datetime
    before_images: List[str] = []
    after_images: List[str] = []
    description: str
    testimonial: Optional[str] = None
    tags: List[str] = []
    is_featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    client_name: str
    client_phone: str
    lead_id: Optional[str] = None
    appointment_type: str  # Consultation, Site Visit, Delivery, Maintenance
    scheduled_date: datetime
    duration_minutes: int = 60
    location: str
    gps_coordinates: Optional[str] = None
    assigned_to: str
    status: str = "Scheduled"  # Scheduled, Confirmed, In Progress, Completed, Cancelled
    notes: Optional[str] = None
    reminder_sent: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InventoryAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    alert_type: str  # Low Stock, Out of Stock, Reorder
    message: str
    current_stock: int
    min_stock_level: int
    is_resolved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ERP Service Class
class ERPService:
    def __init__(self):
        self.product_categories = [
            "Indoor Plants",
            "Outdoor Plants", 
            "Seeds & Saplings",
            "Pots & Planters",
            "Garden Tools",
            "Fertilizers & Nutrients",
            "Soil & Compost",
            "Irrigation Systems",
            "Garden Accessories",
            "Consultation Services",
            "Installation Services",
            "Maintenance Services"
        ]

    async def generate_sku(self, category: str, name: str) -> str:
        """Generate unique SKU for product"""
        category_code = category[:3].upper()
        name_code = ''.join([word[:2].upper() for word in name.split()[:2]])
        timestamp = str(int(datetime.now().timestamp()))[-4:]
        return f"{category_code}-{name_code}-{timestamp}"

    async def calculate_invoice_totals(self, items: List[Dict], tax_percentage: float, discount_percentage: float) -> Dict[str, float]:
        """Calculate invoice totals"""
        subtotal = sum(item['quantity'] * item['price'] for item in items)
        discount_amount = (subtotal * discount_percentage) / 100
        taxable_amount = subtotal - discount_amount
        tax_amount = (taxable_amount * tax_percentage) / 100
        total_amount = taxable_amount + tax_amount
        
        return {
            "subtotal": subtotal,
            "discount_amount": discount_amount,
            "tax_amount": tax_amount,
            "total_amount": total_amount
        }

    async def check_stock_levels(self, products: List[Product]) -> List[InventoryAlert]:
        """Check stock levels and generate alerts"""
        alerts = []
        for product in products:
            if product.stock_quantity == 0:
                alert = InventoryAlert(
                    product_id=product.id,
                    alert_type="Out of Stock",
                    message=f"{product.name} is out of stock",
                    current_stock=product.stock_quantity,
                    min_stock_level=product.min_stock_level
                )
                alerts.append(alert)
            elif product.stock_quantity <= product.min_stock_level:
                alert = InventoryAlert(
                    product_id=product.id,
                    alert_type="Low Stock",
                    message=f"{product.name} stock is running low ({product.stock_quantity} remaining)",
                    current_stock=product.stock_quantity,
                    min_stock_level=product.min_stock_level
                )
                alerts.append(alert)
        
        return alerts

    async def sync_lead_sources(self) -> Dict[str, Any]:
        """Simulate syncing leads from external sources"""
        # In production, integrate with actual APIs
        synced_leads = {
            "indiamart": {
                "new_leads": 15,
                "last_sync": datetime.now(timezone.utc).isoformat(),
                "status": "success"
            },
            "justdial": {
                "new_leads": 8,
                "last_sync": datetime.now(timezone.utc).isoformat(),
                "status": "success"
            },
            "google_ads": {
                "new_leads": 22,
                "last_sync": datetime.now(timezone.utc).isoformat(),
                "status": "success"
            },
            "facebook_ads": {
                "new_leads": 12,
                "last_sync": datetime.now(timezone.utc).isoformat(),
                "status": "success"
            }
        }
        return synced_leads

    async def generate_barcode(self, sku: str) -> str:
        """Generate barcode for product"""
        # Simple barcode generation (in production, use proper barcode library)
        import hashlib
        hash_object = hashlib.md5(sku.encode())
        return hash_object.hexdigest()[:12].upper()

    async def get_sales_analytics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get comprehensive sales analytics"""
        # In production, query actual database
        analytics = {
            "total_revenue": 245000,
            "total_invoices": 45,
            "average_order_value": 5444,
            "top_selling_products": [
                {"name": "Monstera Deliciosa", "quantity_sold": 25, "revenue": 12500},
                {"name": "Garden Tool Kit", "quantity_sold": 18, "revenue": 9000},
                {"name": "Organic Fertilizer", "quantity_sold": 35, "revenue": 7000}
            ],
            "revenue_by_category": {
                "Plants": 150000,
                "Tools": 45000,
                "Services": 50000
            },
            "monthly_growth": 15.5,
            "customer_acquisition": 25,
            "repeat_customers": 12
        }
        return analytics

# Complete HRMS Service Class
class CompleteHRMSService:
    def __init__(self):
        self.departments = [
            "Sales", "Design", "Operations", "Admin", 
            "Marketing", "Customer Service", "Finance"
        ]
        
    async def process_face_recognition_checkin(self, employee_id: str, face_image_data: str, location: str) -> Dict[str, Any]:
        """Process face recognition check-in"""
        # In production, integrate with face recognition API
        recognition_result = {
            "employee_id": employee_id,
            "face_match_confidence": 95.8,
            "location": location,
            "timestamp": datetime.now(timezone.utc),
            "status": "success" if 95.8 > 85 else "failed",
            "check_in_time": datetime.now(timezone.utc)
        }
        return recognition_result

    async def calculate_monthly_salary(self, employee_id: str, month: int, year: int) -> Dict[str, Any]:
        """Calculate monthly salary based on attendance"""
        # In production, fetch actual attendance data
        attendance_data = {
            "total_working_days": 22,
            "days_present": 20,
            "days_absent": 1,
            "days_leave": 1,
            "overtime_hours": 8
        }
        
        base_salary = 35000  # In production, fetch from employee record
        per_day_salary = base_salary / 22
        
        salary_calculation = {
            "base_salary": base_salary,
            "days_worked": attendance_data["days_present"],
            "earned_salary": per_day_salary * attendance_data["days_present"],
            "overtime_amount": (base_salary / 176) * attendance_data["overtime_hours"],  # 8hrs * 22days = 176
            "deductions": per_day_salary * attendance_data["days_absent"],
            "net_salary": (per_day_salary * attendance_data["days_present"]) + ((base_salary / 176) * attendance_data["overtime_hours"]),
            "month": month,
            "year": year
        }
        
        return salary_calculation

    async def generate_payroll_report(self, month: int, year: int) -> Dict[str, Any]:
        """Generate comprehensive payroll report"""
        employees = [
            {"id": "EMP001", "name": "Rajesh Kumar", "department": "Sales", "base_salary": 35000},
            {"id": "EMP002", "name": "Priya Sharma", "department": "Design", "base_salary": 32000},
            {"id": "EMP003", "name": "Amit Patel", "department": "Operations", "base_salary": 28000}
        ]
        
        payroll_data = []
        total_payroll = 0
        
        for emp in employees:
            salary_calc = await self.calculate_monthly_salary(emp["id"], month, year)
            payroll_data.append({
                **emp,
                **salary_calc
            })
            total_payroll += salary_calc["net_salary"]
        
        return {
            "month": month,
            "year": year,
            "employees": payroll_data,
            "total_payroll": total_payroll,
            "total_employees": len(employees),
            "generated_at": datetime.now(timezone.utc)
        }

# Analytics Service
class AnalyticsService:
    def __init__(self):
        pass
    
    async def generate_executive_dashboard(self) -> Dict[str, Any]:
        """Generate comprehensive executive dashboard"""
        dashboard = {
            "business_overview": {
                "total_revenue_ytd": 2450000,
                "growth_rate": 25.5,
                "active_customers": 245,
                "customer_satisfaction": 4.8,
                "market_share": 12.5
            },
            "sales_metrics": {
                "monthly_revenue": 245000,
                "monthly_growth": 15.2,
                "conversion_rate": 22.5,
                "average_deal_size": 15000,
                "sales_cycle_days": 14
            },
            "operational_metrics": {
                "project_completion_rate": 95.8,
                "on_time_delivery": 92.3,
                "inventory_turnover": 8.5,
                "employee_productivity": 87.2
            },
            "marketing_metrics": {
                "lead_generation": 150,
                "cost_per_lead": 450,
                "roi_marketing": 320,
                "brand_awareness": 65.8
            },
            "financial_health": {
                "profit_margin": 18.5,
                "cash_flow": 450000,
                "accounts_receivable": 125000,
                "debt_to_equity": 0.3
            }
        }
        return dashboard

    async def export_report_pdf(self, report_type: str, data: Dict) -> str:
        """Export report to PDF"""
        # In production, use reportlab or similar library
        pdf_filename = f"{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        return f"/reports/{pdf_filename}"

    async def export_report_excel(self, report_type: str, data: Dict) -> str:
        """Export report to Excel"""
        # In production, use openpyxl or similar library  
        excel_filename = f"{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        return f"/reports/{excel_filename}"

# Global service instances
erp_service = ERPService()
hrms_service = CompleteHRMSService()
analytics_service = AnalyticsService()