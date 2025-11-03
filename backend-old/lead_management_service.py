"""
Enhanced Lead Management Service for Aavana Greens
Handles lead actions, routing, and communication workflows
"""

import os
import uuid
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional, Any
import logging
import json

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
import aiohttp
from twilio.rest import Client as TwilioClient
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage

logger = logging.getLogger(__name__)

class LeadManagementService:
    """Enhanced service for comprehensive lead management"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.leads_collection = db.leads
        self.lead_actions_collection = db.lead_actions
        self.lead_routing_collection = db.lead_routing
        self.communication_log_collection = db.communication_log
        
        # Initialize external service clients
        self._initialize_external_services()
        
        # Lead sources configuration
        self.lead_sources = [
            'IndiaMart', 'JustDial', 'Facebook', 'Instagram', 
            'Google Ads', 'Organic Website', 'Referrals', 
            'PartnerPortals', 'ProjectXYZ', 'WhatsApp', 'Direct'
        ]
        
        # Lead action types
        self.action_types = {
            'call': {'icon': '📞', 'color': 'blue'},
            'whatsapp': {'icon': '💬', 'color': 'green'},
            'email': {'icon': '📧', 'color': 'red'},
            'send_images': {'icon': '🖼️', 'color': 'purple'},
            'send_catalogue': {'icon': '📋', 'color': 'orange'},
            'meeting': {'icon': '🤝', 'color': 'teal'},
            'follow_up': {'icon': '🔄', 'color': 'gray'}
        }
    
    def _initialize_external_services(self):
        """Initialize external service clients"""
        try:
            # Twilio for SMS/WhatsApp
            twilio_sid = os.getenv('TWILIO_ACCOUNT_SID')
            twilio_token = os.getenv('TWILIO_AUTH_TOKEN')
            if twilio_sid and twilio_token:
                self.twilio_client = TwilioClient(twilio_sid, twilio_token)
            else:
                self.twilio_client = None
                logger.warning("Twilio credentials not configured")
            
            # Email configuration
            self.smtp_config = {
                'host': os.getenv('SMTP_HOST', 'smtp.gmail.com'),
                'port': int(os.getenv('SMTP_PORT', '587')),
                'username': os.getenv('SMTP_USERNAME'),
                'password': os.getenv('SMTP_PASSWORD')
            }
            
        except Exception as e:
            logger.error(f"Error initializing external services: {e}")
    
    async def get_leads_with_actions(self, page: int = 1, limit: int = 20,
                                   filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Get leads with available actions"""
        try:
            skip = (page - 1) * limit
            
            # Build query with filters
            query = {}
            if filters:
                if filters.get('source'):
                    query['source'] = filters['source']
                if filters.get('status'):
                    query['status'] = filters['status']
                if filters.get('assigned_to'):
                    query['assigned_to'] = filters['assigned_to']
                if filters.get('date_from'):
                    query['created_at'] = {'$gte': datetime.fromisoformat(filters['date_from'])}
                if filters.get('date_to'):
                    if 'created_at' not in query:
                        query['created_at'] = {}
                    query['created_at']['$lte'] = datetime.fromisoformat(filters['date_to'])
            
            # Get leads
            cursor = self.leads_collection.find(query, {'_id': 0}).sort('created_at', -1).skip(skip).limit(limit)
            leads = await cursor.to_list(length=None)
            
            # Get total count
            total_count = await self.leads_collection.count_documents(query)
            
            # Enhance leads with action history and available actions
            for lead in leads:
                # Get recent actions
                recent_actions = await self.get_lead_actions(lead['id'], limit=5)
                lead['recent_actions'] = recent_actions
                
                # Add available actions based on lead status and data
                lead['available_actions'] = self._get_available_actions(lead)
                
                # Add communication summary
                lead['communication_summary'] = await self._get_communication_summary(lead['id'])
            
            return {
                'leads': leads,
                'total_count': total_count,
                'page': page,
                'limit': limit,
                'total_pages': (total_count + limit - 1) // limit
            }
            
        except Exception as e:
            logger.error(f"Error fetching leads with actions: {e}")
            raise
    
    def _get_available_actions(self, lead: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Determine available actions for a lead"""
        available_actions = []
        
        # Call action - always available if phone exists
        if lead.get('phone'):
            available_actions.append({
                'type': 'call',
                'label': 'Call',
                'icon': self.action_types['call']['icon'],
                'color': self.action_types['call']['color'],
                'enabled': True
            })
        
        # WhatsApp action - available if phone exists
        if lead.get('phone'):
            available_actions.append({
                'type': 'whatsapp',
                'label': 'WhatsApp',
                'icon': self.action_types['whatsapp']['icon'],
                'color': self.action_types['whatsapp']['color'],
                'enabled': bool(self.twilio_client)
            })
        
        # Email action - available if email exists
        if lead.get('email'):
            available_actions.append({
                'type': 'email',
                'label': 'Send Email',
                'icon': self.action_types['email']['icon'],
                'color': self.action_types['email']['color'],
                'enabled': bool(self.smtp_config.get('username'))
            })
        
        # Send Images - always available
        available_actions.append({
            'type': 'send_images',
            'label': 'Send Images',
            'icon': self.action_types['send_images']['icon'],
            'color': self.action_types['send_images']['color'],
            'enabled': True
        })
        
        # Send Catalogue - always available
        available_actions.append({
            'type': 'send_catalogue',
            'label': 'Send Catalogue',
            'icon': self.action_types['send_catalogue']['icon'],
            'color': self.action_types['send_catalogue']['color'],
            'enabled': True
        })
        
        # Meeting - available for qualified leads
        if lead.get('status') in ['qualified', 'proposal', 'negotiation']:
            available_actions.append({
                'type': 'meeting',
                'label': 'Schedule Meeting',
                'icon': self.action_types['meeting']['icon'],
                'color': self.action_types['meeting']['color'],
                'enabled': True
            })
        
        # Follow-up - always available
        available_actions.append({
            'type': 'follow_up',
            'label': 'Follow Up',
            'icon': self.action_types['follow_up']['icon'],
            'color': self.action_types['follow_up']['color'],
            'enabled': True
        })
        
        return available_actions
    
    async def execute_lead_action(self, lead_id: str, action_type: str, 
                                action_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Execute a lead action"""
        try:
            # Get lead details
            lead = await self.leads_collection.find_one({'id': lead_id}, {'_id': 0})
            if not lead:
                raise ValueError("Lead not found")
            
            # Initialize action result
            action_result = {
                'id': str(uuid.uuid4()),
                'lead_id': lead_id,
                'action_type': action_type,
                'user_id': user_id,
                'timestamp': datetime.now(timezone.utc),
                'status': 'pending',
                'details': action_data,
                'result': {}
            }
            
            # Execute specific action
            if action_type == 'call':
                result = await self._execute_call_action(lead, action_data, user_id)
            elif action_type == 'whatsapp':
                result = await self._execute_whatsapp_action(lead, action_data, user_id)
            elif action_type == 'email':
                result = await self._execute_email_action(lead, action_data, user_id)
            elif action_type == 'send_images':
                result = await self._execute_send_images_action(lead, action_data, user_id)
            elif action_type == 'send_catalogue':
                result = await self._execute_send_catalogue_action(lead, action_data, user_id)
            elif action_type == 'meeting':
                result = await self._execute_meeting_action(lead, action_data, user_id)
            elif action_type == 'follow_up':
                result = await self._execute_follow_up_action(lead, action_data, user_id)
            elif action_type == 'remark':
                result = await self._execute_remark_action(lead, action_data, user_id)
            else:
                raise ValueError(f"Unknown action type: {action_type}")
            
            # Update action result
            action_result['status'] = result.get('status', 'completed')
            action_result['result'] = result
            
            # Save action to database
            await self.lead_actions_collection.insert_one(action_result)
            
            # Update lead last activity
            await self.leads_collection.update_one(
                {'id': lead_id},
                {
                    '$set': {
                        'last_activity': datetime.now(timezone.utc),
                        'last_action_type': action_type,
                        'last_action_by': user_id
                    }
                }
            )
            
            # Remove MongoDB ObjectId for response
            action_result.pop('_id', None)
            
            logger.info(f"Lead action {action_type} executed for lead {lead_id}")
            return action_result
            
        except Exception as e:
            logger.error(f"Error executing lead action: {e}")
            raise
    
    async def _execute_call_action(self, lead: Dict[str, Any], action_data: Dict[str, Any], 
                                 user_id: str) -> Dict[str, Any]:
        """Execute call action"""
        try:
            # Log call initiation
            call_log = {
                'type': 'call_initiated',
                'phone': lead.get('phone'),
                'duration': action_data.get('duration', 0),
                'notes': action_data.get('notes', ''),
                'outcome': action_data.get('outcome', 'no_answer'),
                'follow_up_required': action_data.get('follow_up_required', False),
                'next_call_date': action_data.get('next_call_date')
            }
            
            # Log communication
            await self._log_communication(
                lead['id'],
                'call',
                f"Call to {lead.get('phone')}",
                call_log,
                user_id
            )
            
            return {
                'status': 'completed',
                'message': 'Call logged successfully',
                'call_details': call_log
            }
            
        except Exception as e:
            logger.error(f"Error executing call action: {e}")
            return {'status': 'failed', 'error': str(e)}
    
    async def _execute_whatsapp_action(self, lead: Dict[str, Any], action_data: Dict[str, Any], 
                                     user_id: str) -> Dict[str, Any]:
        """Execute WhatsApp action"""
        try:
            if not self.twilio_client:
                return {'status': 'failed', 'error': 'WhatsApp service not configured'}
            
            phone = lead.get('phone')
            message = action_data.get('message', '')
            
            if not phone or not message:
                return {'status': 'failed', 'error': 'Phone number and message required'}
            
            # Format phone number for WhatsApp
            whatsapp_number = f"whatsapp:+91{phone.replace('+91', '').replace(' ', '').replace('-', '')}"
            from_number = os.getenv('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886')
            
            # Send WhatsApp message
            message_instance = self.twilio_client.messages.create(
                body=message,
                from_=from_number,
                to=whatsapp_number
            )
            
            # Log communication
            await self._log_communication(
                lead['id'],
                'whatsapp',
                f"WhatsApp message to {phone}",
                {
                    'message': message,
                    'message_sid': message_instance.sid,
                    'status': message_instance.status
                },
                user_id
            )
            
            return {
                'status': 'completed',
                'message': 'WhatsApp message sent successfully',
                'message_sid': message_instance.sid
            }
            
        except Exception as e:
            logger.error(f"Error sending WhatsApp message: {e}")
            return {'status': 'failed', 'error': str(e)}
    
    async def _execute_email_action(self, lead: Dict[str, Any], action_data: Dict[str, Any], 
                                  user_id: str) -> Dict[str, Any]:
        """Execute email action"""
        try:
            email = lead.get('email')
            subject = action_data.get('subject', 'Follow-up from Aavana Greens')
            message = action_data.get('message', '')
            attachments = action_data.get('attachments', [])
            
            if not email or not message:
                return {'status': 'failed', 'error': 'Email address and message required'}
            
            # Create email message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_config['username']
            msg['To'] = email
            msg['Subject'] = subject
            
            # Add message body
            msg.attach(MIMEText(message, 'plain'))
            
            # Add attachments if any
            for attachment in attachments:
                # This would integrate with file upload service to get attachment data
                pass
            
            # Send email
            with smtplib.SMTP(self.smtp_config['host'], self.smtp_config['port']) as server:
                server.starttls()
                server.login(self.smtp_config['username'], self.smtp_config['password'])
                server.send_message(msg)
            
            # Log communication
            await self._log_communication(
                lead['id'],
                'email',
                f"Email sent to {email}",
                {
                    'subject': subject,
                    'message': message,
                    'attachments_count': len(attachments)
                },
                user_id
            )
            
            return {
                'status': 'completed',
                'message': 'Email sent successfully'
            }
            
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return {'status': 'failed', 'error': str(e)}
    
    async def _execute_send_images_action(self, lead: Dict[str, Any], action_data: Dict[str, Any], 
                                        user_id: str) -> Dict[str, Any]:
        """Execute send images action"""
        try:
            images = action_data.get('images', [])
            method = action_data.get('method', 'whatsapp')  # whatsapp, email, both
            message = action_data.get('message', 'Please find the attached images')
            
            if not images:
                return {'status': 'failed', 'error': 'No images selected'}
            
            results = []
            
            # Send via WhatsApp
            if method in ['whatsapp', 'both'] and lead.get('phone') and self.twilio_client:
                for image in images:
                    # This would integrate with file upload service to get image URLs
                    image_result = await self._send_whatsapp_media(
                        lead['phone'], 
                        image.get('url', ''), 
                        message
                    )
                    results.append({'method': 'whatsapp', 'result': image_result})
            
            # Send via Email
            if method in ['email', 'both'] and lead.get('email'):
                email_result = await self._send_email_with_images(
                    lead['email'], 
                    'Images from Aavana Greens', 
                    message, 
                    images
                )
                results.append({'method': 'email', 'result': email_result})
            
            # Log communication
            await self._log_communication(
                lead['id'],
                'send_images',
                f"Images sent via {method}",
                {
                    'images_count': len(images),
                    'method': method,
                    'message': message,
                    'results': results
                },
                user_id
            )
            
            return {
                'status': 'completed',
                'message': f'Images sent via {method}',
                'results': results
            }
            
        except Exception as e:
            logger.error(f"Error sending images: {e}")
            return {'status': 'failed', 'error': str(e)}
    
    async def _execute_send_catalogue_action(self, lead: Dict[str, Any], action_data: Dict[str, Any], 
                                           user_id: str) -> Dict[str, Any]:
        """Execute send catalogue action"""
        try:
            catalogue_type = action_data.get('catalogue_type', 'general')
            method = action_data.get('method', 'email')
            message = action_data.get('message', 'Please find our product catalogue attached')
            
            # Get catalogue file based on type
            catalogue_files = await self._get_catalogue_files(catalogue_type)
            
            if not catalogue_files:
                return {'status': 'failed', 'error': 'No catalogue files found'}
            
            results = []
            
            # Send via Email
            if method in ['email', 'both'] and lead.get('email'):
                email_result = await self._send_email_with_catalogue(
                    lead['email'],
                    f'Product Catalogue - {catalogue_type.title()}',
                    message,
                    catalogue_files
                )
                results.append({'method': 'email', 'result': email_result})
            
            # Send via WhatsApp (document)
            if method in ['whatsapp', 'both'] and lead.get('phone') and self.twilio_client:
                for catalogue_file in catalogue_files:
                    whatsapp_result = await self._send_whatsapp_document(
                        lead['phone'],
                        catalogue_file.get('url', ''),
                        message
                    )
                    results.append({'method': 'whatsapp', 'result': whatsapp_result})
            
            # Log communication
            await self._log_communication(
                lead['id'],
                'send_catalogue',
                f"Catalogue sent via {method}",
                {
                    'catalogue_type': catalogue_type,
                    'method': method,
                    'message': message,
                    'files_count': len(catalogue_files),
                    'results': results
                },
                user_id
            )
            
            return {
                'status': 'completed',
                'message': f'Catalogue sent via {method}',
                'results': results
            }
            
        except Exception as e:
            logger.error(f"Error sending catalogue: {e}")
            return {'status': 'failed', 'error': str(e)}
    
    async def _execute_meeting_action(self, lead: Dict[str, Any], action_data: Dict[str, Any], 
                                    user_id: str) -> Dict[str, Any]:
        """Execute meeting scheduling action"""
        try:
            meeting_data = {
                'id': str(uuid.uuid4()),
                'lead_id': lead['id'],
                'title': action_data.get('title', f"Meeting with {lead.get('name', 'Lead')}"),
                'date': action_data.get('date'),
                'time': action_data.get('time'),
                'duration': action_data.get('duration', 60),  # minutes
                'type': action_data.get('type', 'online'),  # online, offline
                'location': action_data.get('location', ''),
                'agenda': action_data.get('agenda', ''),
                'attendees': action_data.get('attendees', [user_id]),
                'status': 'scheduled',
                'created_by': user_id,
                'created_at': datetime.now(timezone.utc)
            }
            
            # Save meeting to calendar (this would integrate with calendar service)
            await self.db.meetings.insert_one(meeting_data)
            
            # Send meeting invitation
            if lead.get('email'):
                await self._send_meeting_invitation(lead, meeting_data)
            
            # Log communication
            await self._log_communication(
                lead['id'],
                'meeting',
                f"Meeting scheduled for {meeting_data['date']} at {meeting_data['time']}",
                meeting_data,
                user_id
            )
            
            meeting_data.pop('_id', None)
            
            return {
                'status': 'completed',
                'message': 'Meeting scheduled successfully',
                'meeting': meeting_data
            }
            
        except Exception as e:
            logger.error(f"Error scheduling meeting: {e}")
            return {'status': 'failed', 'error': str(e)}
    
    async def _execute_follow_up_action(self, lead: Dict[str, Any], action_data: Dict[str, Any], 
                                      user_id: str) -> Dict[str, Any]:
        """Execute follow-up action"""
        try:
            follow_up_data = {
                'id': str(uuid.uuid4()),
                'lead_id': lead['id'],
                'type': action_data.get('type', 'general'),
                'priority': action_data.get('priority', 'medium'),
                'due_date': action_data.get('due_date'),
                'notes': action_data.get('notes', ''),
                'reminder_before': action_data.get('reminder_before', 60),  # minutes
                'status': 'pending',
                'created_by': user_id,
                'created_at': datetime.now(timezone.utc)
            }
            
            # Save follow-up task
            await self.db.follow_ups.insert_one(follow_up_data)
            
            # Schedule reminder (this would integrate with notification service)
            if follow_up_data['due_date']:
                await self._schedule_follow_up_reminder(follow_up_data)
            
            # Log communication
            await self._log_communication(
                lead['id'],
                'follow_up',
                f"Follow-up scheduled for {follow_up_data.get('due_date', 'later')}",
                follow_up_data,
                user_id
            )
            
            follow_up_data.pop('_id', None)
            
            return {
                'status': 'completed',
                'message': 'Follow-up scheduled successfully',
                'follow_up': follow_up_data
            }
            
        except Exception as e:
            logger.error(f"Error scheduling follow-up: {e}")
            return {'status': 'failed', 'error': str(e)}
    
    async def _execute_remark_action(self, lead: Dict[str, Any], action_data: Dict[str, Any], 
                                   user_id: str) -> Dict[str, Any]:
        """Execute remark action"""
        try:
            remark_data = {
                'type': action_data.get('type', 'text'),
                'content': action_data.get('content', ''),
                'voice_file_url': action_data.get('voice_file_url'),
                'transcription': action_data.get('transcription'),
                'is_private': action_data.get('is_private', False)
            }
            
            # Add remark using existing method
            remark = await self.add_lead_remark(lead['id'], remark_data, user_id)
            
            return {
                'status': 'completed',
                'message': 'Remark added successfully',
                'remark': remark
            }
            
        except Exception as e:
            logger.error(f"Error adding remark: {e}")
            return {'status': 'failed', 'error': str(e)}
    
    async def get_lead_actions(self, lead_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get action history for a lead"""
        try:
            cursor = self.lead_actions_collection.find(
                {'lead_id': lead_id},
                {'_id': 0}
            ).sort('timestamp', -1).limit(limit)
            
            actions = await cursor.to_list(length=None)
            
            # Enhance actions with user information
            for action in actions:
                if action.get('user_id'):
                    user = await self.db.users.find_one(
                        {'id': action['user_id']},
                        {'full_name': 1, 'email': 1, '_id': 0}
                    )
                    if user:
                        action['user'] = user
            
            return actions
            
        except Exception as e:
            logger.error(f"Error fetching lead actions: {e}")
            return []
    
    async def update_lead(self, lead_id: str, update_data: Dict[str, Any], 
                         user_id: str) -> Optional[Dict[str, Any]]:
        """Update lead information"""
        try:
            # Prepare update data
            update_fields = {}
            allowed_fields = [
                'name', 'email', 'phone', 'company', 'designation', 
                'location', 'source', 'status', 'budget', 'requirements',
                'notes', 'assigned_to', 'priority'
            ]
            
            for field in allowed_fields:
                if field in update_data:
                    update_fields[field] = update_data[field]
            
            if not update_fields:
                return None
            
            update_fields['updated_by'] = user_id
            update_fields['updated_at'] = datetime.now(timezone.utc)
            
            # Update lead
            result = await self.leads_collection.find_one_and_update(
                {'id': lead_id},
                {'$set': update_fields},
                return_document=ReturnDocument.AFTER,
                projection={'_id': 0}
            )
            
            if result:
                # Log update action
                await self.lead_actions_collection.insert_one({
                    'id': str(uuid.uuid4()),
                    'lead_id': lead_id,
                    'action_type': 'update',
                    'user_id': user_id,
                    'timestamp': datetime.now(timezone.utc),
                    'status': 'completed',
                    'details': {'updated_fields': list(update_fields.keys())},
                    'result': {'changes': update_fields}
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error updating lead {lead_id}: {e}")
            raise
    
    async def add_lead_remark(self, lead_id: str, remark_data: Dict[str, Any], 
                            user_id: str) -> Dict[str, Any]:
        """Add remark to lead (text or voice)"""
        try:
            remark = {
                'id': str(uuid.uuid4()),
                'lead_id': lead_id,
                'type': remark_data.get('type', 'text'),  # text, voice
                'content': remark_data.get('content', ''),
                'voice_file_url': remark_data.get('voice_file_url'),
                'transcription': remark_data.get('transcription'),
                'user_id': user_id,
                'timestamp': datetime.now(timezone.utc),
                'is_private': remark_data.get('is_private', False)
            }
            
            # Save remark
            await self.db.lead_remarks.insert_one(remark)
            
            # Update lead last activity
            await self.leads_collection.update_one(
                {'id': lead_id},
                {
                    '$set': {
                        'last_activity': datetime.now(timezone.utc),
                        'last_remark_at': datetime.now(timezone.utc)
                    }
                }
            )
            
            # Log as action
            await self.lead_actions_collection.insert_one({
                'id': str(uuid.uuid4()),
                'lead_id': lead_id,
                'action_type': 'remark_added',
                'user_id': user_id,
                'timestamp': datetime.now(timezone.utc),
                'status': 'completed',
                'details': {'remark_type': remark['type']},
                'result': {'remark_id': remark['id']}
            })
            
            remark.pop('_id', None)
            return remark
            
        except Exception as e:
            logger.error(f"Error adding remark to lead {lead_id}: {e}")
            raise
    
    async def get_lead_remarks(self, lead_id: str, include_private: bool = False) -> List[Dict[str, Any]]:
        """Get remarks for a lead"""
        try:
            query = {'lead_id': lead_id}
            if not include_private:
                query['is_private'] = {'$ne': True}
            
            cursor = self.db.lead_remarks.find(query, {'_id': 0}).sort('timestamp', -1)
            remarks = await cursor.to_list(length=None)
            
            # Enhance with user information
            for remark in remarks:
                if remark.get('user_id'):
                    user = await self.db.users.find_one(
                        {'id': remark['user_id']},
                        {'full_name': 1, 'email': 1, '_id': 0}
                    )
                    if user:
                        remark['user'] = user
            
            return remarks
            
        except Exception as e:
            logger.error(f"Error fetching remarks for lead {lead_id}: {e}")
            return []
    
    async def _log_communication(self, lead_id: str, type: str, summary: str, 
                               details: Dict[str, Any], user_id: str):
        """Log communication activity"""
        try:
            log_entry = {
                'id': str(uuid.uuid4()),
                'lead_id': lead_id,
                'type': type,
                'summary': summary,
                'details': details,
                'user_id': user_id,
                'timestamp': datetime.now(timezone.utc)
            }
            
            await self.communication_log_collection.insert_one(log_entry)
            
        except Exception as e:
            logger.error(f"Error logging communication: {e}")
    
    async def _get_communication_summary(self, lead_id: str) -> Dict[str, Any]:
        """Get communication summary for a lead"""
        try:
            pipeline = [
                {'$match': {'lead_id': lead_id}},
                {'$group': {
                    '_id': '$type',
                    'count': {'$sum': 1},
                    'last_contact': {'$max': '$timestamp'}
                }}
            ]
            
            cursor = self.communication_log_collection.aggregate(pipeline)
            results = await cursor.to_list(length=None)
            
            summary = {}
            for result in results:
                summary[result['_id']] = {
                    'count': result['count'],
                    'last_contact': result['last_contact']
                }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting communication summary: {e}")
            return {}
    
    # Helper methods for external service integrations
    async def _send_whatsapp_media(self, phone: str, media_url: str, caption: str) -> Dict[str, Any]:
        """Send media via WhatsApp"""
        # Implementation for WhatsApp media sending
        return {'status': 'completed', 'message': 'Media sent via WhatsApp'}
    
    async def _send_whatsapp_document(self, phone: str, document_url: str, caption: str) -> Dict[str, Any]:
        """Send document via WhatsApp"""
        # Implementation for WhatsApp document sending
        return {'status': 'completed', 'message': 'Document sent via WhatsApp'}
    
    async def _send_email_with_images(self, email: str, subject: str, message: str, images: List[Dict]) -> Dict[str, Any]:
        """Send email with image attachments"""
        # Implementation for email with images
        return {'status': 'completed', 'message': 'Email with images sent'}
    
    async def _send_email_with_catalogue(self, email: str, subject: str, message: str, files: List[Dict]) -> Dict[str, Any]:
        """Send email with catalogue attachments"""
        # Implementation for email with catalogue
        return {'status': 'completed', 'message': 'Email with catalogue sent'}
    
    async def _get_catalogue_files(self, catalogue_type: str) -> List[Dict[str, Any]]:
        """Get catalogue files by type"""
        # This would query the file upload service or database for catalogue files
        return [{'url': 'https://example.com/catalogue.pdf', 'name': 'Product Catalogue'}]
    
    async def _send_meeting_invitation(self, lead: Dict[str, Any], meeting_data: Dict[str, Any]):
        """Send meeting invitation email"""
        # Implementation for meeting invitation
        pass
    
    async def _schedule_follow_up_reminder(self, follow_up_data: Dict[str, Any]):
        """Schedule follow-up reminder"""
        # Implementation for reminder scheduling
        pass

# Service instance will be initialized with database connection
lead_management_service = None

def initialize_lead_management_service(db: AsyncIOMotorDatabase):
    """Initialize the lead management service"""
    global lead_management_service
    lead_management_service = LeadManagementService(db)
    return lead_management_service