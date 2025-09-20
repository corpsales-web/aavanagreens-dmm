"""
Voice Speech-to-Text Service for Aavana Greens
Handles voice remarks, voice-to-task, and real-time transcription
"""

import os
import asyncio
import uuid
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, AsyncGenerator
from io import BytesIO
import tempfile

import aiohttp
import whisper
import numpy as np
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

class VoiceSTTService:
    """Service for voice processing and speech-to-text conversion"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.transcriptions_collection = db.transcriptions
        self.voice_tasks_collection = db.voice_tasks
        
        # STT Configuration
        self.stt_providers = {
            'whisper_local': {'enabled': True, 'priority': 3},
            'assemblyai': {'enabled': bool(os.getenv('ASSEMBLYAI_API_KEY')), 'priority': 1},
            'deepgram': {'enabled': bool(os.getenv('DEEPGRAM_API_KEY')), 'priority': 2}
        }
        
        # Initialize Whisper model for offline processing
        self.whisper_model = None
        self._initialize_whisper()
        
        # Task extraction patterns
        self.task_patterns = [
            r"(?:remind me to|remember to|need to|have to|should|must)\s+(.+?)(?:\.|$|,|tomorrow|today|next week|by)",
            r"(?:schedule|set up|arrange)\s+(?:a\s+)?(.+?)(?:\s+for|\s+with|\s+on|\.|$)",
            r"(?:call|phone|contact)\s+(.+?)(?:\s+about|\s+regarding|\.|$)",
            r"(?:follow up|check)\s+(?:on\s+|with\s+)?(.+?)(?:\.|$|,)",
            r"(?:buy|purchase|get|pick up)\s+(.+?)(?:\.|$|,|from|at)",
            r"(?:book|reserve)\s+(.+?)(?:\s+for|\s+at|\.|$)",
            r"(?:send|email|write)\s+(.+?)(?:\s+to|\s+about|\.|$)"
        ]
        
        # Priority keywords
        self.priority_keywords = {
            "urgent": ["urgent", "asap", "immediately", "critical", "emergency"],
            "high": ["important", "priority", "soon", "today", "tomorrow"],
            "medium": ["next week", "this week", "when possible"],
            "low": ["someday", "eventually", "maybe", "consider"]
        }
        
        # Category keywords
        self.category_keywords = {
            "meeting": ["meeting", "call", "conference", "discussion", "standup"],
            "communication": ["email", "call", "text", "message", "contact"],
            "follow_up": ["follow up", "check", "remind", "contact again"],
            "task": ["task", "todo", "complete", "finish", "work on"],
            "personal": ["personal", "family", "friend", "home"]
        }
    
    def _initialize_whisper(self):
        """Initialize Whisper model for offline processing"""
        try:
            model_size = os.getenv('WHISPER_MODEL_SIZE', 'base')  # tiny, base, small, medium, large
            self.whisper_model = whisper.load_model(model_size)
            logger.info(f"Whisper model '{model_size}' loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            self.whisper_model = None
    
    async def transcribe_audio(self, audio_data: bytes, language: str = "auto",
                             provider: Optional[str] = None) -> Dict[str, Any]:
        """Transcribe audio using available STT providers"""
        try:
            # Choose best available provider
            if not provider:
                provider = self._get_best_provider()
            
            if provider == 'assemblyai' and self.stt_providers['assemblyai']['enabled']:
                result = await self._transcribe_with_assemblyai(audio_data, language)
            elif provider == 'deepgram' and self.stt_providers['deepgram']['enabled']:
                result = await self._transcribe_with_deepgram(audio_data, language)
            elif provider == 'whisper_local' and self.whisper_model:
                result = await self._transcribe_with_whisper(audio_data, language)
            else:
                raise ValueError(f"Provider {provider} not available")
            
            # Store transcription
            transcription_record = {
                'id': str(uuid.uuid4()),
                'text': result['text'],
                'confidence': result.get('confidence', 0.0),
                'language': result.get('language', language),
                'provider': provider,
                'duration': result.get('duration', 0.0),
                'created_at': datetime.now(timezone.utc)
            }
            
            await self.transcriptions_collection.insert_one(transcription_record)
            transcription_record.pop('_id', None)
            
            return transcription_record
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            raise
    
    def _get_best_provider(self) -> str:
        """Get the best available STT provider"""
        available_providers = [
            (name, config) for name, config in self.stt_providers.items() 
            if config['enabled']
        ]
        
        if not available_providers:
            raise ValueError("No STT providers available")
        
        # Sort by priority (lower number = higher priority)
        available_providers.sort(key=lambda x: x[1]['priority'])
        return available_providers[0][0]
    
    async def _transcribe_with_assemblyai(self, audio_data: bytes, language: str) -> Dict[str, Any]:
        """Transcribe using AssemblyAI"""
        try:
            api_key = os.getenv('ASSEMBLYAI_API_KEY')
            base_url = "https://api.assemblyai.com/v2"
            
            headers = {"authorization": api_key}
            
            async with aiohttp.ClientSession() as session:
                # Upload audio file
                async with session.post(
                    f"{base_url}/upload",
                    headers=headers,
                    data=audio_data
                ) as upload_response:
                    upload_result = await upload_response.json()
                    audio_url = upload_result["upload_url"]
                
                # Request transcription
                transcript_request = {
                    "audio_url": audio_url,
                    "language_detection": True if language == "auto" else False,
                    "auto_chapters": False,
                    "speaker_labels": False
                }
                
                if language != "auto":
                    transcript_request["language_code"] = language
                
                async with session.post(
                    f"{base_url}/transcript",
                    headers=headers,
                    json=transcript_request
                ) as response:
                    transcript = await response.json()
                    transcript_id = transcript["id"]
                
                # Poll for completion
                while True:
                    async with session.get(
                        f"{base_url}/transcript/{transcript_id}",
                        headers=headers
                    ) as status_response:
                        result = await status_response.json()
                        
                        if result["status"] == "completed":
                            return {
                                "text": result["text"],
                                "confidence": result.get("confidence", 0.0),
                                "language": result.get("language_code", language),
                                "duration": result.get("audio_duration", 0.0)
                            }
                        elif result["status"] == "error":
                            raise Exception(f"AssemblyAI transcription failed: {result.get('error', 'Unknown error')}")
                    
                    await asyncio.sleep(1)
                    
        except Exception as e:
            logger.error(f"AssemblyAI transcription error: {e}")
            raise
    
    async def _transcribe_with_deepgram(self, audio_data: bytes, language: str) -> Dict[str, Any]:
        """Transcribe using Deepgram"""
        try:
            api_key = os.getenv('DEEPGRAM_API_KEY')
            url = "https://api.deepgram.com/v1/listen"
            
            headers = {
                "Authorization": f"Token {api_key}",
                "Content-Type": "audio/wav"
            }
            
            params = {
                "punctuate": True,
                "language": language if language != "auto" else "en",
                "model": "nova-2",
                "smart_format": True
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    headers=headers,
                    params=params,
                    data=audio_data
                ) as response:
                    result = await response.json()
                    
                    if "results" in result:
                        channel = result["results"]["channels"][0]
                        alternatives = channel["alternatives"][0]
                        
                        return {
                            "text": alternatives["transcript"],
                            "confidence": alternatives.get("confidence", 0.0),
                            "language": result.get("metadata", {}).get("language", language),
                            "duration": result.get("metadata", {}).get("duration", 0.0)
                        }
                    else:
                        raise Exception("No transcription results returned from Deepgram")
                        
        except Exception as e:
            logger.error(f"Deepgram transcription error: {e}")
            raise
    
    async def _transcribe_with_whisper(self, audio_data: bytes, language: str) -> Dict[str, Any]:
        """Transcribe using local Whisper model"""
        try:
            if not self.whisper_model:
                raise Exception("Whisper model not available")
            
            # Convert audio data to numpy array
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file.flush()
                
                # Transcribe using Whisper
                result = self.whisper_model.transcribe(
                    temp_file.name,
                    language=None if language == "auto" else language,
                    task="transcribe"
                )
                
                # Clean up temp file
                os.unlink(temp_file.name)
                
                return {
                    "text": result["text"].strip(),
                    "confidence": 0.9,  # Whisper doesn't provide confidence scores
                    "language": result.get("language", language),
                    "duration": result.get("duration", 0.0)
                }
                
        except Exception as e:
            logger.error(f"Whisper transcription error: {e}")
            raise
    
    async def process_voice_remark(self, audio_data: bytes, lead_id: str, 
                                 user_id: str, language: str = "auto") -> Dict[str, Any]:
        """Process voice remark and convert to text"""
        try:
            # Transcribe audio
            transcription = await self.transcribe_audio(audio_data, language)
            
            # Store voice remark
            voice_remark = {
                'id': str(uuid.uuid4()),
                'lead_id': lead_id,
                'user_id': user_id,
                'transcription_id': transcription['id'],
                'transcription_text': transcription['text'],
                'confidence': transcription['confidence'],
                'language': transcription['language'],
                'audio_duration': transcription.get('duration', 0.0),
                'created_at': datetime.now(timezone.utc)
            }
            
            # Store in database (would integrate with lead management service)
            await self.db.voice_remarks.insert_one(voice_remark)
            voice_remark.pop('_id', None)
            
            return voice_remark
            
        except Exception as e:
            logger.error(f"Error processing voice remark: {e}")
            raise
    
    async def extract_tasks_from_voice(self, audio_data: bytes, user_id: str,
                                     language: str = "auto") -> Dict[str, Any]:
        """Extract tasks from voice input"""
        try:
            # Transcribe audio
            transcription = await self.transcribe_audio(audio_data, language)
            
            # Extract tasks from transcription
            tasks = await self._extract_tasks_from_text(transcription['text'])
            
            # Store voice task record
            voice_task_record = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'transcription_id': transcription['id'],
                'transcription_text': transcription['text'],
                'extracted_tasks': tasks,
                'language': transcription['language'],
                'confidence': transcription['confidence'],
                'created_at': datetime.now(timezone.utc)
            }
            
            await self.voice_tasks_collection.insert_one(voice_task_record)
            voice_task_record.pop('_id', None)
            
            return voice_task_record
            
        except Exception as e:
            logger.error(f"Error extracting tasks from voice: {e}")
            raise
    
    async def _extract_tasks_from_text(self, text: str) -> List[Dict[str, Any]]:
        """Extract tasks from transcribed text using pattern matching"""
        try:
            import re
            
            tasks = []
            text_lower = text.lower()
            
            # Extract tasks using regex patterns
            for pattern in self.task_patterns:
                matches = re.finditer(pattern, text_lower, re.IGNORECASE)
                for match in matches:
                    task_text = match.group(1).strip()
                    if len(task_text) > 3:  # Filter out very short matches
                        task = {
                            'id': str(uuid.uuid4()),
                            'text': task_text,
                            'priority': self._detect_priority(task_text, text_lower),
                            'category': self._detect_category(task_text),
                            'due_date': self._extract_due_date(task_text, text_lower),
                            'extracted_from': match.group(0),
                            'confidence': 0.8,
                            'status': 'pending'
                        }
                        tasks.append(task)
            
            # If no specific task patterns found, check if the entire text is a task
            if not tasks and len(text.strip()) > 10:
                # Check for general task indicators
                task_indicators = ['task', 'todo', 'do', 'complete', 'finish', 'work on']
                if any(indicator in text_lower for indicator in task_indicators):
                    task = {
                        'id': str(uuid.uuid4()),
                        'text': text.strip(),
                        'priority': self._detect_priority(text, text_lower),
                        'category': self._detect_category(text),
                        'due_date': self._extract_due_date(text, text_lower),
                        'extracted_from': text,
                        'confidence': 0.6,
                        'status': 'pending'
                    }
                    tasks.append(task)
            
            return tasks
            
        except Exception as e:
            logger.error(f"Error extracting tasks from text: {e}")
            return []
    
    def _detect_priority(self, task_text: str, context: str) -> str:
        """Detect task priority based on keywords"""
        combined_text = (task_text + " " + context).lower()
        
        for priority, keywords in self.priority_keywords.items():
            if any(keyword in combined_text for keyword in keywords):
                return priority
        
        return "medium"  # Default priority
    
    def _detect_category(self, task_text: str) -> str:
        """Detect task category based on keywords"""
        text_lower = task_text.lower()
        
        for category, keywords in self.category_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return category
        
        return "general"  # Default category
    
    def _extract_due_date(self, task_text: str, context: str) -> Optional[str]:
        """Extract due date from task text and context"""
        import re
        import dateparser
        
        combined_text = task_text + " " + context
        
        # Common date patterns
        date_patterns = [
            r"today",
            r"tomorrow", 
            r"next week",
            r"this week",
            r"next month",
            r"by (.+?)(?:\.|$|,)",
            r"on (.+?)(?:\.|$|,)",
            r"(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}",
            r"\d{1,2}/\d{1,2}(?:/\d{2,4})?"
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, combined_text, re.IGNORECASE)
            if match:
                date_text = match.group(0) if pattern in ["today", "tomorrow", "next week", "this week", "next month"] else match.group(1)
                
                # Parse date using dateparser
                try:
                    parsed_date = dateparser.parse(date_text)
                    if parsed_date:
                        return parsed_date.strftime("%Y-%m-%d")
                except:
                    continue
        
        return None
    
    async def get_voice_transcriptions(self, user_id: Optional[str] = None,
                                     limit: int = 50) -> List[Dict[str, Any]]:
        """Get voice transcription history"""
        try:
            query = {}
            if user_id:
                # This would need to be joined with voice_remarks or voice_tasks
                # For now, return all transcriptions
                pass
            
            cursor = self.transcriptions_collection.find(
                query, {'_id': 0}
            ).sort('created_at', -1).limit(limit)
            
            transcriptions = await cursor.to_list(length=None)
            return transcriptions
            
        except Exception as e:
            logger.error(f"Error fetching voice transcriptions: {e}")
            return []
    
    async def get_voice_tasks(self, user_id: str, status: Optional[str] = None,
                            limit: int = 50) -> List[Dict[str, Any]]:
        """Get voice-extracted tasks for a user"""
        try:
            query = {'user_id': user_id}
            if status:
                query['extracted_tasks.status'] = status
            
            cursor = self.voice_tasks_collection.find(
                query, {'_id': 0}
            ).sort('created_at', -1).limit(limit)
            
            voice_tasks = await cursor.to_list(length=None)
            return voice_tasks
            
        except Exception as e:
            logger.error(f"Error fetching voice tasks: {e}")
            return []
    
    async def update_task_status(self, voice_task_id: str, task_id: str, 
                               status: str, user_id: str) -> bool:
        """Update status of an extracted task"""
        try:
            result = await self.voice_tasks_collection.update_one(
                {
                    'id': voice_task_id,
                    'user_id': user_id,
                    'extracted_tasks.id': task_id
                },
                {
                    '$set': {
                        'extracted_tasks.$.status': status,
                        'extracted_tasks.$.updated_at': datetime.now(timezone.utc)
                    }
                }
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error updating task status: {e}")
            return False
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of STT service"""
        health_status = {
            'service': 'voice_stt',
            'status': 'healthy',
            'providers': {},
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        # Check each provider
        for provider, config in self.stt_providers.items():
            try:
                if provider == 'whisper_local':
                    status = 'healthy' if self.whisper_model else 'unavailable'
                elif provider == 'assemblyai':
                    status = 'healthy' if config['enabled'] else 'not_configured'
                elif provider == 'deepgram':
                    status = 'healthy' if config['enabled'] else 'not_configured'
                else:
                    status = 'unknown'
                
                health_status['providers'][provider] = {
                    'status': status,
                    'enabled': config['enabled'],
                    'priority': config['priority']
                }
                
            except Exception as e:
                health_status['providers'][provider] = {
                    'status': 'error',
                    'error': str(e)
                }
        
        # Overall service status
        healthy_providers = sum(1 for p in health_status['providers'].values() if p.get('status') == 'healthy')
        if healthy_providers == 0:
            health_status['status'] = 'unhealthy'
        elif healthy_providers < len(self.stt_providers):
            health_status['status'] = 'degraded'
        
        return health_status

# Service instance will be initialized with database connection
voice_stt_service = None

def initialize_voice_stt_service(db: AsyncIOMotorDatabase):
    """Initialize the voice STT service"""
    global voice_stt_service
    voice_stt_service = VoiceSTTService(db)
    return voice_stt_service