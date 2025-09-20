"""
AAVANA 2.0 - MULTILINGUAL ORCHESTRATION LAYER
==============================================

Non-disruptive conversational automation manager for:
- In-app chat interface
- WhatsApp Business API (360Dialog)
- Exotel voice integration with STT

Features:
- Multilingual support (Hindi, English, Hinglish, Tamil)
- Language detection and Hinglish normalization
- Intent parsing with GPT-5
- Deterministic safety rules
- Idempotency and operation IDs
- Event bus and state management
- Dead letter queue and retries
- Cost-first design with fallbacks
"""

from fastapi import HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timezone
import json
import uuid
import os
import re
import asyncio
import hashlib
from enum import Enum
from dotenv import load_dotenv

# Import existing AI service
from ai_service import ai_service

load_dotenv()

# Aavana 2.0 Models
class SupportedLanguage(str, Enum):
    HINDI = "hi"
    ENGLISH = "en"
    HINGLISH = "hi-en"  # Code-mixed Hindi-English
    TAMIL = "ta"
    UNKNOWN = "unknown"

class ChannelType(str, Enum):
    IN_APP_CHAT = "in_app_chat"
    WHATSAPP = "whatsapp"
    EXOTEL_VOICE = "exotel_voice"
    SMS = "sms"

class IntentType(str, Enum):
    LEAD_INQUIRY = "lead_inquiry"
    PRODUCT_INQUIRY = "product_inquiry"
    APPOINTMENT_BOOKING = "appointment_booking"
    PRICE_INQUIRY = "price_inquiry"
    SUPPORT_REQUEST = "support_request"
    COMPLAINT = "complaint"
    GENERAL_CHAT = "general_chat"
    TASK_CREATION = "task_creation"
    BUSINESS_QUERY = "business_query"

class OperationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRY = "retry"
    DLQ = "dlq"

class ConversationRequest(BaseModel):
    """Input request for Aavana 2.0"""
    operation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    channel: ChannelType
    user_id: str
    message: str
    language: Optional[SupportedLanguage] = None
    context: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ConversationResponse(BaseModel):
    """Output response from Aavana 2.0"""
    operation_id: str
    response_text: str
    language: SupportedLanguage
    intent: IntentType
    confidence: float
    actions: List[Dict[str, Any]] = []
    follow_up_required: bool = False
    cached_audio_url: Optional[str] = None
    suggested_replies: List[str] = []
    session_id: str
    processing_time_ms: int

class OperationState(BaseModel):
    """State tracking for operations"""
    operation_id: str
    status: OperationStatus
    channel: ChannelType
    user_id: str
    original_message: str
    processed_message: str
    language: SupportedLanguage
    intent: IntentType
    confidence: float
    response: Optional[str] = None
    retry_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    error_message: Optional[str] = None

# Language Processing Components
class LanguageDetector:
    """Detects language from user input"""
    
    def __init__(self):
        # Hindi keywords for detection
        self.hindi_patterns = {
            'devanagari': r'[\u0900-\u097F]+',
            'common_hindi': ['kya', 'hai', 'hoon', 'nahin', 'main', 'aap', 'kar', 'ho', 
                           'mujhe', 'kaise', 'kahan', 'kyun', 'kitna', 'kaun', 'kab', 'jab'],
            'hindi_romanized': ['acha', 'achha', 'theek', 'thik', 'paisa', 'rupee', 'rupay']
        }
        
        # Tamil keywords for detection
        self.tamil_patterns = {
            'tamil_script': r'[\u0B80-\u0BFF]+',
            'common_tamil': ['naan', 'nenga', 'enna', 'epdi', 'enga', 'enna', 'illa']
        }
        
        # Hinglish patterns (code-mixed indicators)
        self.hinglish_patterns = [
            r'\b(kya|hai|ho|kar|main|aap)\s+\w+',  # Hindi + English mix
            r'\w+\s+(hai|ho|kar|kya)\b',  # English + Hindi mix
            r'\b(please|ok|okay)\s+(kar|karo|de|do)\b',  # English + Hindi verbs
        ]

    async def detect_language(self, text: str) -> SupportedLanguage:
        """Detect language from input text"""
        text_lower = text.lower()
        
        # Check for Devanagari script (Hindi)
        if re.search(self.hindi_patterns['devanagari'], text):
            return SupportedLanguage.HINDI
            
        # Check for Tamil script
        if re.search(self.tamil_patterns['tamil_script'], text):
            return SupportedLanguage.TAMIL
        
        # Check for Hinglish patterns
        for pattern in self.hinglish_patterns:
            if re.search(pattern, text_lower):
                return SupportedLanguage.HINGLISH
        
        # Check for Hindi keywords (romanized)
        hindi_word_count = 0
        for word in self.hindi_patterns['common_hindi'] + self.hindi_patterns['hindi_romanized']:
            if word in text_lower:
                hindi_word_count += 1
        
        # Check for Tamil keywords (romanized)
        tamil_word_count = 0
        for word in self.tamil_patterns['common_tamil']:
            if word in text_lower:
                tamil_word_count += 1
        
        # Language decision logic
        if hindi_word_count >= 2:
            return SupportedLanguage.HINGLISH if any(eng in text_lower for eng in ['is', 'are', 'the', 'and', 'or', 'but']) else SupportedLanguage.HINDI
        elif tamil_word_count >= 2:
            return SupportedLanguage.TAMIL
        elif self._is_english(text_lower):
            return SupportedLanguage.ENGLISH
        else:
            return SupportedLanguage.UNKNOWN
    
    def _is_english(self, text: str) -> bool:
        """Check if text is primarily English"""
        english_indicators = ['is', 'are', 'the', 'and', 'or', 'but', 'can', 'will', 'would', 'should']
        return any(word in text for word in english_indicators)

class HinglishNormalizer:
    """Normalizes Hinglish text for better NLP processing"""
    
    def __init__(self):
        # Common romanized Hindi to normalized forms
        self.normalization_map = {
            # Greetings
            'namaste': 'नमस्ते', 'namaskar': 'नमस्कार',
            'sat sri akal': 'सत श्री अकाल', 'adab': 'आदाब',
            
            # Common words
            'acha': 'अच्छा', 'achha': 'अच्छा', 'accha': 'अच्छा',
            'theek': 'ठीक', 'thik': 'ठीक', 'theak': 'ठीक',
            'paisa': 'पैसा', 'paise': 'पैसे', 'rupee': 'रुपए', 'rupay': 'रुपए',
            'ghar': 'घर', 'ghar': 'घर', 'makaan': 'मकान',
            'kaam': 'काम', 'kam': 'काम', 'kary': 'कार्य',
            
            # Question words
            'kya': 'क्या', 'kia': 'क्या', 'kyaa': 'क्या',
            'kaise': 'कैसे', 'kese': 'कैसे', 'kaisey': 'कैसे',
            'kahan': 'कहाँ', 'kaha': 'कहाँ', 'kahaan': 'कहाँ',
            'kitna': 'कितना', 'kitne': 'कितने', 'kitni': 'कितनी',
            'kyun': 'क्यों', 'kyon': 'क्यों', 'kyu': 'क्यों',
            
            # Verbs
            'kar': 'कर', 'karr': 'कर', 'karo': 'करो',
            'de': 'दे', 'do': 'दो', 'dena': 'देना', 'diya': 'दिया',
            'le': 'ले', 'lo': 'लो', 'lena': 'लेना', 'liya': 'लिया',
            'aa': 'आ', 'aao': 'आओ', 'aana': 'आना', 'aaya': 'आया',
            'ja': 'जा', 'jao': 'जाओ', 'jana': 'जाना', 'gaya': 'गया',
            
            # Common expressions
            'haan': 'हाँ', 'han': 'हाँ', 'ha': 'हाँ',
            'nahin': 'नहीं', 'nahi': 'नहीं', 'na': 'ना',
            'ji': 'जी', 'jee': 'जी', 'sahib': 'साहिब',
            'dhanyawad': 'धन्यवाद', 'shukriya': 'शुक्रिया',
        }
        
        # Common phrases
        self.phrase_normalization = {
            'kya haal hai': 'क्या हाल है',
            'kaise ho': 'कैसे हो',
            'theek hai': 'ठीक है',
            'acha hai': 'अच्छा है',
            'kitna paisa': 'कितना पैसा',
            'kitne paise': 'कितने पैसे',
        }

    async def normalize_hinglish(self, text: str) -> str:
        """Normalize Hinglish text for better processing"""
        normalized_text = text.lower()
        
        # First normalize common phrases
        for phrase, normalized in self.phrase_normalization.items():
            normalized_text = normalized_text.replace(phrase, f"{phrase} ({normalized})")
        
        # Then normalize individual words
        words = normalized_text.split()
        normalized_words = []
        
        for word in words:
            # Remove punctuation for matching
            clean_word = re.sub(r'[^\w\s]', '', word)
            if clean_word in self.normalization_map:
                normalized_words.append(f"{word} ({self.normalization_map[clean_word]})")
            else:
                normalized_words.append(word)
        
        return ' '.join(normalized_words)

# Intent Processing
class IntentParser:
    """GPT-5 powered intent parsing with deterministic safety rules"""
    
    def __init__(self):
        self.safety_rules = {
            # High-confidence deterministic rules
            'price_inquiry': ['price', 'cost', 'rate', 'kitna', 'paisa', 'rupee', 'charge', 'fee'],
            'appointment_booking': ['appointment', 'visit', 'meet', 'schedule', 'book', 'time', 'date'],
            'product_inquiry': ['plant', 'garden', 'nursery', 'catalog', 'product', 'service'],
            'complaint': ['problem', 'issue', 'complaint', 'not working', 'broken', 'defective'],
            'support_request': ['help', 'support', 'assistance', 'question', 'doubt'],
        }

    async def parse_intent(self, message: str, language: SupportedLanguage, context: Dict = None) -> tuple[IntentType, float]:
        """Parse intent using deterministic rules + GPT-5 fallback"""
        
        # First try deterministic rules (fast, cost-free)
        deterministic_intent, confidence = self._apply_safety_rules(message.lower())
        if confidence > 0.8:
            return deterministic_intent, confidence
        
        # Fallback to GPT-5 for complex cases
        try:
            intent_prompt = self._build_intent_prompt(message, language, context)
            response = await ai_service.orchestrator.route_task("automation", intent_prompt, context)
            
            # Parse GPT-5 response
            ai_intent, ai_confidence = self._parse_gpt5_response(response)
            
            # Combine deterministic + AI results
            if deterministic_intent != IntentType.GENERAL_CHAT and confidence > 0.5:
                # Trust deterministic rules more
                return deterministic_intent, max(confidence, ai_confidence * 0.8)
            else:
                return ai_intent, ai_confidence
                
        except Exception as e:
            # Fallback to deterministic result
            return deterministic_intent if deterministic_intent != IntentType.GENERAL_CHAT else IntentType.GENERAL_CHAT, 0.6

    def _apply_safety_rules(self, message: str) -> tuple[IntentType, float]:
        """Apply deterministic safety rules for intent detection"""
        intent_scores = {}
        
        for intent_name, keywords in self.safety_rules.items():
            score = sum(1 for keyword in keywords if keyword in message)
            if score > 0:
                intent_scores[intent_name] = score / len(keywords)
        
        if intent_scores:
            best_intent = max(intent_scores, key=intent_scores.get)
            confidence = min(intent_scores[best_intent] * 2, 1.0)  # Scale to max 1.0
            
            # Map string to enum
            intent_mapping = {
                'price_inquiry': IntentType.PRICE_INQUIRY,
                'appointment_booking': IntentType.APPOINTMENT_BOOKING,
                'product_inquiry': IntentType.PRODUCT_INQUIRY,
                'complaint': IntentType.COMPLAINT,
                'support_request': IntentType.SUPPORT_REQUEST,
            }
            
            return intent_mapping.get(best_intent, IntentType.GENERAL_CHAT), confidence
        
        return IntentType.GENERAL_CHAT, 0.3

    def _build_intent_prompt(self, message: str, language: SupportedLanguage, context: Dict = None) -> str:
        """Build language-aware intent parsing prompt"""
        
        language_context = {
            SupportedLanguage.HINDI: "यह संदेश हिंदी में है।",
            SupportedLanguage.ENGLISH: "This message is in English.",
            SupportedLanguage.HINGLISH: "यह संदेश हिंग्लिश (हिंदी-अंग्रेजी मिश्रित) में है।",
            SupportedLanguage.TAMIL: "இந்த செய்தி தமிழில் உள்ளது।",
        }
        
        return f"""
        Analyze this customer message for Aavana Greens (green building & nursery business):
        
        Message: "{message}"
        Language: {language_context.get(language, "Unknown language")}
        Context: {json.dumps(context) if context else "None"}
        
        Determine the customer's intent from these options:
        1. LEAD_INQUIRY - New customer interested in services
        2. PRODUCT_INQUIRY - Questions about plants, tools, services
        3. APPOINTMENT_BOOKING - Wants to schedule visit/consultation
        4. PRICE_INQUIRY - Asking about costs, pricing, budget
        5. SUPPORT_REQUEST - Needs help or has questions
        6. COMPLAINT - Has a problem or issue
        7. GENERAL_CHAT - Casual conversation
        8. TASK_CREATION - Wants to create task or reminder
        9. BUSINESS_QUERY - Internal business questions
        
        Respond with only: INTENT_NAME:CONFIDENCE_SCORE (0.0-1.0)
        Example: PRICE_INQUIRY:0.85
        """

    def _parse_gpt5_response(self, response: str) -> tuple[IntentType, float]:
        """Parse GPT-5 intent response"""
        try:
            # Look for pattern INTENT_NAME:CONFIDENCE_SCORE
            pattern = r'([A-Z_]+):(\d+\.?\d*)'
            match = re.search(pattern, response.upper())
            
            if match:
                intent_str, confidence_str = match.groups()
                confidence = float(confidence_str)
                
                # Map to enum
                try:
                    intent = IntentType(intent_str.lower())
                    return intent, min(confidence, 1.0)
                except ValueError:
                    pass
            
        except Exception:
            pass
        
        # Fallback parsing
        return IntentType.GENERAL_CHAT, 0.5

# State Management
class StateManager:
    """Manages operation state and implements event bus"""
    
    def __init__(self):
        self.state_store = {}  # In production, use Redis/MongoDB
        self.event_bus = []    # In production, use proper message queue
        self.dlq = []          # Dead letter queue
        
    async def create_operation(self, request: ConversationRequest) -> OperationState:
        """Create new operation state"""
        state = OperationState(
            operation_id=request.operation_id,
            status=OperationStatus.PENDING,
            channel=request.channel,
            user_id=request.user_id,
            original_message=request.message,
            processed_message=request.message,
            language=request.language or SupportedLanguage.UNKNOWN,
            intent=IntentType.GENERAL_CHAT,
            confidence=0.0
        )
        
        self.state_store[request.operation_id] = state
        await self._publish_event("operation_created", state.dict())
        return state
    
    async def update_operation(self, operation_id: str, updates: Dict[str, Any]) -> OperationState:
        """Update operation state"""
        if operation_id not in self.state_store:
            raise ValueError(f"Operation {operation_id} not found")
        
        state = self.state_store[operation_id]
        
        for key, value in updates.items():
            if hasattr(state, key):
                setattr(state, key, value)
        
        state.updated_at = datetime.now(timezone.utc)
        
        await self._publish_event("operation_updated", state.dict())
        return state
    
    async def get_operation(self, operation_id: str) -> Optional[OperationState]:
        """Get operation state"""
        return self.state_store.get(operation_id)
    
    async def retry_operation(self, operation_id: str) -> bool:
        """Retry failed operation"""
        state = self.state_store.get(operation_id)
        if not state:
            return False
        
        if state.retry_count >= 3:
            # Move to DLQ
            await self.move_to_dlq(operation_id, "Max retries exceeded")
            return False
        
        state.retry_count += 1
        state.status = OperationStatus.RETRY
        state.updated_at = datetime.now(timezone.utc)
        
        await self._publish_event("operation_retry", state.dict())
        return True
    
    async def move_to_dlq(self, operation_id: str, reason: str):
        """Move operation to dead letter queue"""
        state = self.state_store.get(operation_id)
        if state:
            state.status = OperationStatus.DLQ
            state.error_message = reason
            self.dlq.append(state)
            await self._publish_event("operation_dlq", state.dict())
    
    async def _publish_event(self, event_type: str, data: Dict[str, Any]):
        """Publish event to event bus"""
        event = {
            "event_type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data
        }
        self.event_bus.append(event)
        # In production, publish to Redis/RabbitMQ/Cloud Pub/Sub

# Audio Cache Manager
class AudioCacheManager:
    """Manages cached audio templates for Phase 1 TTS alternative"""
    
    def __init__(self):
        # Pre-recorded audio templates (URLs to cached files)
        self.audio_templates = {
            # English templates
            'en': {
                'welcome': '/audio/cache/en_welcome.mp3',
                'thank_you': '/audio/cache/en_thank_you.mp3',
                'appointment_confirmed': '/audio/cache/en_appointment_confirmed.mp3',
                'price_inquiry_response': '/audio/cache/en_price_inquiry.mp3',
                'catalog_intro': '/audio/cache/en_catalog_intro.mp3',
            },
            # Hindi templates
            'hi': {
                'welcome': '/audio/cache/hi_welcome.mp3',
                'thank_you': '/audio/cache/hi_thank_you.mp3',
                'appointment_confirmed': '/audio/cache/hi_appointment_confirmed.mp3',
                'price_inquiry_response': '/audio/cache/hi_price_inquiry.mp3',
                'catalog_intro': '/audio/cache/hi_catalog_intro.mp3',
            },
            # Hinglish templates
            'hi-en': {
                'welcome': '/audio/cache/hinglish_welcome.mp3',
                'thank_you': '/audio/cache/hinglish_thank_you.mp3',
                'appointment_confirmed': '/audio/cache/hinglish_appointment_confirmed.mp3',
                'price_inquiry_response': '/audio/cache/hinglish_price_inquiry.mp3',
                'catalog_intro': '/audio/cache/hinglish_catalog_intro.mp3',
            }
        }
        
        # Template text for generating cached audio (for Phase 2 TTS)
        self.template_texts = {
            'en': {
                'welcome': "Welcome to Aavana Greens! Your trusted partner for green building solutions and beautiful gardens. How can we help you today?",
                'thank_you': "Thank you for contacting Aavana Greens. We'll get back to you shortly with a personalized solution.",
                'appointment_confirmed': "Your appointment has been confirmed. Our expert will visit you as scheduled. Thank you for choosing Aavana Greens!",
                'price_inquiry_response': "Thank you for your interest! Our pricing depends on your specific requirements. Let me connect you with our consultant for a personalized quote.",
                'catalog_intro': "Here's our complete catalog of plants and garden solutions. Browse through and let us know what interests you!"
            },
            'hi': {
                'welcome': "आवाना ग्रीन्स में आपका स्वागत है! हरे भवन समाधान और सुंदर बगीचों के लिए आपका विश्वसनीय साझीदार। आज हम आपकी कैसे मदद कर सकते हैं?",
                'thank_you': "आवाना ग्रीन्स से संपर्क करने के लिए धन्यवाद। हम जल्द ही व्यक्तिगत समाधान के साथ आपसे संपर्क करेंगे।",
                'appointment_confirmed': "आपकी अपॉइंटमेंट कन्फर्म हो गई है। हमारे विशेषज्ञ निर्धारित समय पर आपसे मिलेंगे। आवाना ग्रीन्स चुनने के लिए धन्यवाद!",
                'price_inquiry_response': "आपकी रुचि के लिए धन्यवाद! हमारी कीमतें आपकी विशिष्ट आवश्यकताओं पर निर्भर करती हैं। व्यक्तिगत कोटेशन के लिए मैं आपको हमारे सलाहकार से जोड़ता हूं।",
                'catalog_intro': "यहाँ है हमारा पूरा पौधों और बगीचे समाधानों का कैटलॉग। देखिए और बताइए कि आपको क्या पसंद आया!"
            },
            'hi-en': {
                'welcome': "Welcome to Aavana Greens! आपका green building solutions और beautiful gardens के लिए trusted partner। आज हम आपकी कैसे help कर सकते हैं?",
                'thank_you': "Thank you Aavana Greens से contact करने के लिए। हम जल्दी आपको personalized solution के साथ reply करेंगे।",
                'appointment_confirmed': "आपकी appointment confirm हो गई है। हमारा expert scheduled time पर आपसे visit करेगा। Aavana Greens choose करने के लिए thank you!",
                'price_inquiry_response': "आपकी interest के लिए thank you! हमारी pricing आपकी specific requirements पर depend करती है। Personal quote के लिए मैं आपको consultant से connect करता हूं।",
                'catalog_intro': "यहाँ है हमारा complete catalog of plants और garden solutions। Browse करिए और बताइए कि आपको क्या interesting लगा!"
            }
        }

    async def get_cached_audio(self, template_key: str, language: SupportedLanguage) -> Optional[str]:
        """Get cached audio URL for template"""
        lang_code = language.value if language != SupportedLanguage.UNKNOWN else 'en'
        return self.audio_templates.get(lang_code, {}).get(template_key)
    
    async def get_template_text(self, template_key: str, language: SupportedLanguage) -> Optional[str]:
        """Get template text for TTS generation"""
        lang_code = language.value if language != SupportedLanguage.UNKNOWN else 'en'
        return self.template_texts.get(lang_code, {}).get(template_key)
    
    async def suggest_cached_template(self, intent: IntentType, language: SupportedLanguage) -> Optional[tuple[str, str]]:
        """Suggest cached template based on intent"""
        template_mapping = {
            IntentType.GENERAL_CHAT: 'welcome',
            IntentType.PRICE_INQUIRY: 'price_inquiry_response',
            IntentType.PRODUCT_INQUIRY: 'catalog_intro',
            IntentType.APPOINTMENT_BOOKING: 'appointment_confirmed',
            IntentType.SUPPORT_REQUEST: 'thank_you',
        }
        
        template_key = template_mapping.get(intent)
        if template_key:
            audio_url = await self.get_cached_audio(template_key, language)
            text = await self.get_template_text(template_key, language)
            return audio_url, text
        
        return None

# Main Aavana 2.0 Orchestrator
class Aavana2Orchestrator:
    """Central orchestration layer for all conversational AI"""
    
    def __init__(self):
        self.language_detector = LanguageDetector()
        self.hinglish_normalizer = HinglishNormalizer()
        self.intent_parser = IntentParser()
        self.state_manager = StateManager()
        self.audio_cache = AudioCacheManager()
        
        # Cost control settings
        self.daily_spend_limit = 500  # ₹500 per day
        self.current_daily_spend = 0
        
    async def process_conversation(self, request: ConversationRequest) -> ConversationResponse:
        """Main conversation processing pipeline"""
        start_time = datetime.now()
        
        try:
            # 1. Create operation state
            state = await self.state_manager.create_operation(request)
            
            # 2. Check idempotency
            if await self._is_duplicate_operation(request):
                return await self._get_cached_response(request.operation_id)
            
            # 3. Detect language
            detected_language = request.language
            if not detected_language or detected_language == SupportedLanguage.UNKNOWN:
                detected_language = await self.language_detector.detect_language(request.message)
            
            await self.state_manager.update_operation(request.operation_id, {
                "language": detected_language,
                "status": OperationStatus.PROCESSING
            })
            
            # 4. Normalize Hinglish if needed
            processed_message = request.message
            if detected_language == SupportedLanguage.HINGLISH:
                processed_message = await self.hinglish_normalizer.normalize_hinglish(request.message)
            
            await self.state_manager.update_operation(request.operation_id, {
                "processed_message": processed_message
            })
            
            # 5. Parse intent
            intent, confidence = await self.intent_parser.parse_intent(
                processed_message, detected_language, request.context
            )
            
            await self.state_manager.update_operation(request.operation_id, {
                "intent": intent,
                "confidence": confidence
            })
            
            # 6. Generate response
            response_text, actions = await self._generate_response(
                processed_message, detected_language, intent, confidence, request.context
            )
            
            # 7. Get cached audio if available
            cached_audio = await self._get_cached_audio_response(intent, detected_language)
            
            # 8. Generate suggested replies
            suggested_replies = await self._generate_suggested_replies(
                intent, detected_language
            )
            
            # 9. Build response
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            response = ConversationResponse(
                operation_id=request.operation_id,
                response_text=response_text,
                language=detected_language,
                intent=intent,
                confidence=confidence,
                actions=actions,
                cached_audio_url=cached_audio,
                suggested_replies=suggested_replies,
                session_id=request.session_id or str(uuid.uuid4()),
                processing_time_ms=processing_time
            )
            
            # 10. Update final state
            await self.state_manager.update_operation(request.operation_id, {
                "status": OperationStatus.COMPLETED,
                "response": response_text
            })
            
            return response
            
        except Exception as e:
            # Handle errors and retry logic
            await self.state_manager.update_operation(request.operation_id, {
                "status": OperationStatus.FAILED,
                "error_message": str(e)
            })
            
            # Retry if appropriate
            if await self.state_manager.retry_operation(request.operation_id):
                return await self.process_conversation(request)
            
            # Fallback response
            return await self._generate_fallback_response(request, str(e))
    
    async def _is_duplicate_operation(self, request: ConversationRequest) -> bool:
        """Check for duplicate operations (idempotency)"""
        # Create hash of request content for duplicate detection
        content_hash = hashlib.md5(
            f"{request.user_id}:{request.message}:{request.channel}".encode()
        ).hexdigest()
        
        # In production, check Redis/database for recent operations with same hash
        # For now, check in-memory state
        for op_id, state in self.state_manager.state_store.items():
            if (state.user_id == request.user_id and 
                state.original_message == request.message and
                state.channel == request.channel and
                (datetime.now(timezone.utc) - state.created_at).total_seconds() < 300):  # 5 minutes
                return True
        
        return False
    
    async def _get_cached_response(self, operation_id: str) -> ConversationResponse:
        """Get cached response for duplicate operation"""
        # In production, retrieve from cache
        # For now, return a generic response
        return ConversationResponse(
            operation_id=operation_id,
            response_text="I've already processed this request. Please check your previous message.",
            language=SupportedLanguage.ENGLISH,
            intent=IntentType.GENERAL_CHAT,
            confidence=1.0,
            session_id=str(uuid.uuid4()),
            processing_time_ms=10
        )
    
    async def _generate_response(self, message: str, language: SupportedLanguage, 
                               intent: IntentType, confidence: float, 
                               context: Dict = None) -> tuple[str, List[Dict]]:
        """Generate conversational response"""
        
        # Check cost limits
        if self.current_daily_spend >= self.daily_spend_limit:
            return await self._get_cost_limited_response(intent, language)
        
        # Build language-aware prompt
        prompt = await self._build_response_prompt(message, language, intent, context)
        
        try:
            # Use AI service for response generation
            ai_response = await ai_service.orchestrator.route_task("automation", prompt, context)
            
            # Parse actions from response
            actions = await self._extract_actions_from_response(ai_response, intent)
            
            # Increment cost tracking (estimated)
            self.current_daily_spend += 10  # Rough estimate ₹10 per GPT-5 call
            
            return ai_response, actions
            
        except Exception as e:
            # Fallback to template response
            return await self._get_template_response(intent, language), []
    
    async def _build_response_prompt(self, message: str, language: SupportedLanguage, 
                                   intent: IntentType, context: Dict = None) -> str:
        """Build language-aware response prompt"""
        
        language_instructions = {
            SupportedLanguage.HINDI: "हिंदी में जवाब दें।",
            SupportedLanguage.ENGLISH: "Respond in English.",
            SupportedLanguage.HINGLISH: "Respond in Hinglish (Hindi-English mix) to match user's style.",
            SupportedLanguage.TAMIL: "Respond in Tamil if possible, otherwise English."
        }
        
        intent_context = {
            IntentType.PRICE_INQUIRY: "Focus on pricing, quotations, and budget discussions.",
            IntentType.PRODUCT_INQUIRY: "Provide product information, catalog details, and recommendations.",
            IntentType.APPOINTMENT_BOOKING: "Help schedule visits, consultations, and appointments.",
            IntentType.COMPLAINT: "Address concerns professionally with empathy and solutions.",
            IntentType.SUPPORT_REQUEST: "Provide helpful guidance and support."
        }
        
        return f"""
        You are Aavana 2.0, the AI assistant for Aavana Greens (green building solutions & nursery).
        
        Customer Message: "{message}"
        Detected Intent: {intent.value}
        Language: {language.value}
        Context: {json.dumps(context) if context else "None"}
        
        Instructions:
        - {language_instructions.get(language, "Respond in English")}
        - {intent_context.get(intent, "Provide helpful general assistance")}
        - Be conversational, friendly, and professional
        - Focus on green building solutions, plants, and garden services
        - Include call-to-action or next steps
        - Keep response concise but helpful
        - Business phone: 8447475761
        
        Generate a helpful response:
        """
    
    async def _get_cost_limited_response(self, intent: IntentType, language: SupportedLanguage) -> tuple[str, List[Dict]]:
        """Return cost-limited template response"""
        templates = {
            SupportedLanguage.ENGLISH: "Thank you for contacting Aavana Greens! Due to high volume, please call us directly at 8447475761 for immediate assistance.",
            SupportedLanguage.HINDI: "आवाना ग्रीन्स से संपर्क करने के लिए धन्यवाद! तुरंत सहायता के लिए कृपया 8447475761 पर कॉल करें।",
            SupportedLanguage.HINGLISH: "Thank you Aavana Greens से contact करने के लिए! Immediate help के लिए please 8447475761 पर call करें।"
        }
        
        return templates.get(language, templates[SupportedLanguage.ENGLISH]), []
    
    async def _get_template_response(self, intent: IntentType, language: SupportedLanguage) -> str:
        """Get fallback template response"""
        # Use cached audio template text as fallback
        template_text = await self.audio_cache.get_template_text('welcome', language)
        return template_text or "Thank you for contacting Aavana Greens! How can we help you today?"
    
    async def _get_cached_audio_response(self, intent: IntentType, language: SupportedLanguage) -> Optional[str]:
        """Get cached audio URL for response"""
        template_suggestion = await self.audio_cache.suggest_cached_template(intent, language)
        if template_suggestion:
            audio_url, _ = template_suggestion
            return audio_url
        return None
    
    async def _generate_suggested_replies(self, intent: IntentType, language: SupportedLanguage) -> List[str]:
        """Generate context-aware suggested replies"""
        suggestions = {
            IntentType.PRICE_INQUIRY: {
                SupportedLanguage.ENGLISH: ["Get Quote", "Schedule Visit", "View Catalog"],
                SupportedLanguage.HINDI: ["कोटेशन लें", "विजिट शेड्यूल करें", "कैटलॉग देखें"],
                SupportedLanguage.HINGLISH: ["Quote लें", "Visit schedule करें", "Catalog देखें"]
            },
            IntentType.PRODUCT_INQUIRY: {
                SupportedLanguage.ENGLISH: ["View Plants", "Garden Tools", "Consultation"],
                SupportedLanguage.HINDI: ["पौधे देखें", "बागवानी उपकरण", "सलाह लें"],
                SupportedLanguage.HINGLISH: ["Plants देखें", "Garden tools", "Consultation लें"]
            }
        }
        
        return suggestions.get(intent, {}).get(language, ["Call Now", "More Info", "Help"])
    
    async def _extract_actions_from_response(self, response: str, intent: IntentType) -> List[Dict]:
        """Extract actionable items from AI response"""
        actions = []
        
        # Based on intent, suggest relevant actions
        if intent == IntentType.APPOINTMENT_BOOKING:
            actions.append({
                "type": "create_appointment",
                "priority": "high",
                "data": {"service": "consultation"}
            })
        elif intent == IntentType.LEAD_INQUIRY:
            actions.append({
                "type": "create_lead",
                "priority": "high",
                "data": {"source": "ai_chat"}
            })
        elif intent == IntentType.PRICE_INQUIRY:
            actions.append({
                "type": "send_quotation",
                "priority": "medium",
                "data": {"type": "general"}
            })
        
        return actions
    
    async def _generate_fallback_response(self, request: ConversationRequest, error: str) -> ConversationResponse:
        """Generate fallback response on error"""
        fallback_text = "मुझे खुशी होगी आपकी मदद करने में! कृपया 8447475761 पर कॉल करें। I'd be happy to help you! Please call 8447475761."
        
        return ConversationResponse(
            operation_id=request.operation_id,
            response_text=fallback_text,
            language=SupportedLanguage.HINGLISH,
            intent=IntentType.GENERAL_CHAT,
            confidence=0.5,
            session_id=request.session_id or str(uuid.uuid4()),
            processing_time_ms=100
        )

# Global Aavana 2.0 instance
aavana_2_0 = Aavana2Orchestrator()