"""
MULTI-AI AGENT COORDINATOR
==========================

Advanced multi-AI agent architecture for Aavana Greens CRM with:
- Aavana 2.0 as Central Coordinator
- Specialized AI Agents: Sales AI, Marketing AI, HR AI, ERP AI
- Enhanced voice capabilities with TTS/STT
- Integration with Emergent LLM Key for latest models
- Smart task routing and agent selection
"""

import os
import asyncio
import uuid
import json
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

class AgentType(str, Enum):
    COORDINATOR = "aavana_coordinator"
    SALES = "sales_agent"
    MARKETING = "marketing_agent"
    HR = "hr_agent"
    ERP = "erp_agent"
    VOICE = "voice_agent"

class TaskType(str, Enum):
    LEAD_MANAGEMENT = "lead_management"
    DEAL_EDITING = "deal_editing"
    MARKETING_CAMPAIGN = "marketing_campaign"
    CONTENT_CREATION = "content_creation"
    HR_MANAGEMENT = "hr_management"
    ERP_OPERATIONS = "erp_operations"
    VOICE_INTERACTION = "voice_interaction"
    GENERAL_CHAT = "general_chat"

class AIAgentResponse:
    def __init__(self, success: bool, content: str, actions: List[Dict] = None, metadata: Dict = None):
        self.success = success
        self.content = content
        self.actions = actions or []
        self.metadata = metadata or {}
        self.timestamp = datetime.now(timezone.utc)

class BaseAIAgent:
    """Base class for all AI agents"""
    
    def __init__(self, agent_type: AgentType, model: str = "gpt-5"):
        self.agent_type = agent_type
        self.model = model
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        self.session_id = f"{agent_type.value}_{str(uuid.uuid4())[:8]}"
        
        # Initialize LLM chat based on model
        if model.startswith("gpt") or model.startswith("o1"):
            self.provider = "openai"
        elif model.startswith("claude"):
            self.provider = "anthropic"
        elif model.startswith("gemini"):
            self.provider = "gemini"
        else:
            self.provider = "openai"  # Default
            
        self.chat_instance = None
        
    async def initialize(self):
        """Initialize the AI agent"""
        system_message = self._get_system_message()
        self.chat_instance = LlmChat(
            api_key=self.api_key,
            session_id=self.session_id,
            system_message=system_message
        ).with_model(self.provider, self.model)
        
    def _get_system_message(self) -> str:
        """Override in subclasses for specialized system messages"""
        return "You are a helpful AI assistant for Aavana Greens CRM."
        
    async def process_task(self, task: str, context: Dict = None) -> AIAgentResponse:
        """Process a task and return response"""
        try:
            if not self.chat_instance:
                await self.initialize()
                
            # Create user message with context
            enhanced_message = self._enhance_message_with_context(task, context)
            user_message = UserMessage(text=enhanced_message)
            
            # Get AI response
            response = await self.chat_instance.send_message(user_message)
            
            # Process and extract actions
            actions = self._extract_actions(response, context)
            metadata = self._generate_metadata(context)
            
            return AIAgentResponse(
                success=True,
                content=response,
                actions=actions,
                metadata=metadata
            )
            
        except Exception as e:
            return AIAgentResponse(
                success=False,
                content=f"Error processing task: {str(e)}",
                metadata={"error": str(e)}
            )
    
    def _enhance_message_with_context(self, message: str, context: Dict = None) -> str:
        """Enhance message with context information"""
        if not context:
            return message
            
        context_str = f"Context: {json.dumps(context, indent=2)}\n\nUser Request: {message}"
        return context_str
    
    def _extract_actions(self, response: str, context: Dict = None) -> List[Dict]:
        """Extract actionable items from response - override in subclasses"""
        return []
    
    def _generate_metadata(self, context: Dict = None) -> Dict:
        """Generate metadata for the response"""
        return {
            "agent_type": self.agent_type.value,
            "model_used": self.model,
            "provider": self.provider,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

class SalesAIAgent(BaseAIAgent):
    """Specialized AI agent for sales operations"""
    
    def __init__(self):
        super().__init__(AgentType.SALES, "gpt-5")
        
    def _get_system_message(self) -> str:
        return """You are the Sales AI Agent for Aavana Greens CRM, specializing in:

CORE RESPONSIBILITIES:
- Lead qualification and scoring
- Deal management and editing (under pipeline)
- Sales pipeline optimization
- Lead nurturing strategies
- Conversion rate analysis
- Follow-up scheduling and automation

BUSINESS CONTEXT:
- Company: Aavana Greens (Green building solutions & plant nursery)
- Services: Landscaping, plant nursery, green building design, interior plants
- Target: Residential, commercial, and enterprise clients
- Location: India (primarily Mumbai, Pune, Bangalore)

DEAL EDITING CAPABILITIES:
- Edit deal values, timelines, and stages
- Update deal probability and close dates
- Manage deal team assignments
- Track deal history and notes
- Handle deal conversions and status changes

RESPONSE FORMAT:
- Provide actionable sales insights
- Include specific follow-up actions
- Suggest deal progression strategies
- Offer qualification recommendations
- Generate personalized communication templates

Always maintain a professional, consultative tone focused on helping grow the business through effective sales management."""
        
    def _extract_actions(self, response: str, context: Dict = None) -> List[Dict]:
        """Extract sales-specific actions"""
        actions = []
        
        # Check context for specific sales actions needed
        if context:
            if "lead_id" in context:
                actions.append({
                    "type": "update_lead",
                    "lead_id": context["lead_id"],
                    "priority": "medium"
                })
            
            if "deal_id" in context:
                actions.append({
                    "type": "update_deal",
                    "deal_id": context["deal_id"],
                    "priority": "high"
                })
                
            if "follow_up" in response.lower():
                actions.append({
                    "type": "schedule_follow_up",
                    "priority": "high",
                    "data": {"automated": True}
                })
                
        return actions

class MarketingAIAgent(BaseAIAgent):
    """Specialized AI agent for marketing operations"""
    
    def __init__(self):
        super().__init__(AgentType.MARKETING, "gpt-5")
        
    def _get_system_message(self) -> str:
        return """You are the Marketing AI Agent for Aavana Greens CRM, specializing in:

CORE RESPONSIBILITIES:
- Digital marketing strategy and campaigns
- Content creation (UGC, Brand Content, Reels)
- Social media management across platforms
- Email marketing automation
- WhatsApp bulk marketing campaigns
- SEO and online presence optimization

BUSINESS CONTEXT:
- Company: Aavana Greens (Green building & plant nursery)
- Target Audience: Urban homeowners, architects, interior designers, businesses
- Platforms: Instagram, Facebook, YouTube, WhatsApp, Email
- Content Types: Educational plant care, green building tips, before/after projects

CONTENT CREATION CAPABILITIES:
- Generate UGC campaign strategies
- Create brand content templates
- Develop reel scripts and concepts
- Design email marketing sequences
- Plan multi-platform campaigns

CAMPAIGN MANAGEMENT:
- Google Ads optimization
- Social media campaign coordination
- Bulk WhatsApp marketing strategies
- Email automation workflows
- Performance tracking and optimization

Always provide creative, data-driven marketing solutions that align with green/sustainable living trends."""
        
    def _extract_actions(self, response: str, context: Dict = None) -> List[Dict]:
        """Extract marketing-specific actions"""
        actions = []
        
        if "campaign" in response.lower():
            actions.append({
                "type": "create_campaign",
                "priority": "high",
                "data": {"platform": "multi-platform"}
            })
            
        if "content" in response.lower():
            actions.append({
                "type": "generate_content",
                "priority": "medium",
                "data": {"type": "social_media"}
            })
            
        if "email" in response.lower():
            actions.append({
                "type": "setup_email_sequence",
                "priority": "medium"
            })
            
        return actions

class HRAIAgent(BaseAIAgent):
    """Specialized AI agent for HR operations"""
    
    def __init__(self):
        super().__init__(AgentType.HR, "gpt-4o")  # Using GPT-4o for HR tasks
        
    def _get_system_message(self) -> str:
        return """You are the HR AI Agent for Aavana Greens CRM, specializing in:

CORE RESPONSIBILITIES:
- Employee management and records
- Attendance tracking and face check-in systems
- Leave management and approvals
- Performance evaluation and feedback
- Payroll and benefits administration
- Employee engagement and satisfaction

BUSINESS CONTEXT:
- Company: Aavana Greens (Green building & plant nursery)
- Team Structure: Field workers, sales team, administrative staff, management
- Attendance: Face recognition, GPS check-in, manual entry options
- Work Environment: Mix of office, field, and remote work

HR SYSTEM CAPABILITIES:
- Process attendance data from multiple sources
- Generate payroll reports and calculations
- Manage leave requests and approvals
- Track employee performance metrics
- Handle onboarding and offboarding processes

Always maintain confidentiality and provide helpful HR guidance following best practices and labor law compliance."""
        
    def _extract_actions(self, response: str, context: Dict = None) -> List[Dict]:
        """Extract HR-specific actions"""
        actions = []
        
        if "attendance" in response.lower():
            actions.append({
                "type": "update_attendance",
                "priority": "high"
            })
            
        if "leave" in response.lower():
            actions.append({
                "type": "process_leave_request",
                "priority": "medium"
            })
            
        return actions

class ERPAIAgent(BaseAIAgent):
    """Specialized AI agent for ERP operations"""
    
    def __init__(self):
        super().__init__(AgentType.ERP, "gpt-4o")
        
    def _get_system_message(self) -> str:
        return """You are the ERP AI Agent for Aavana Greens CRM, specializing in:

CORE RESPONSIBILITIES:
- Inventory management (plants, tools, materials)
- Project gallery management and categorization
- Catalogue management with bulk operations
- Supply chain optimization
- Financial reporting and analysis
- Business process automation

BUSINESS CONTEXT:
- Company: Aavana Greens (Green building & plant nursery)
- Inventory: Live plants, gardening tools, building materials, decorative items
- Projects: Residential gardens, commercial landscaping, interior plant installations
- Gallery: Before/after photos, project documentation, plant care guides

BATCH OPERATIONS:
- Bulk send catalogues via WhatsApp/Email (up to 50 items)
- Mass gallery image sharing with clients
- Automated inventory restocking alerts
- Bulk pricing updates and promotions

Always focus on operational efficiency and provide actionable business insights."""
        
    def _extract_actions(self, response: str, context: Dict = None) -> List[Dict]:
        """Extract ERP-specific actions"""
        actions = []
        
        if "inventory" in response.lower():
            actions.append({
                "type": "update_inventory",
                "priority": "medium"
            })
            
        if "batch" in response.lower() or "bulk" in response.lower():
            actions.append({
                "type": "batch_operation",
                "priority": "high",
                "data": {"type": "bulk_send"}
            })
            
        return actions

class VoiceAIAgent(BaseAIAgent):
    """Specialized AI agent for voice interactions and TTS/STT"""
    
    def __init__(self):
        super().__init__(AgentType.VOICE, "gpt-4o")
        
    def _get_system_message(self) -> str:
        return """You are the Voice AI Agent for Aavana Greens CRM, specializing in:

CORE RESPONSIBILITIES:
- Voice-to-text transcription and processing
- Text-to-speech response generation
- Voice command interpretation
- Multilingual voice support (Hindi, English, Hinglish)
- Voice-based task creation and management
- Phone call automation and routing

VOICE CAPABILITIES:
- Convert voice messages to actionable tasks
- Generate natural-sounding voice responses
- Handle voice-based lead qualification
- Process voice notes and memos
- Support hands-free CRM operations

LANGUAGE SUPPORT:
- English: Professional business communication
- Hindi: Local customer interactions
- Hinglish: Mixed language conversations
- Automatic language detection and switching

Always provide clear, concise responses optimized for voice delivery and maintain natural conversation flow."""
        
    async def text_to_speech(self, text: str, language: str = "en") -> Dict:
        """Convert text to speech using AI voice models"""
        try:
            # Implement TTS functionality
            # This would integrate with voice generation services
            return {
                "success": True,
                "audio_url": f"/audio/generated/{uuid.uuid4()}.mp3",
                "duration": len(text) * 0.05,  # Rough estimate
                "language": language
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def speech_to_text(self, audio_data: bytes) -> Dict:
        """Convert speech to text using AI STT models"""
        try:
            # Implement STT functionality
            # This would integrate with speech recognition services
            return {
                "success": True,
                "text": "Transcribed text would go here",
                "confidence": 0.95,
                "language": "en"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

class MultiAICoordinator:
    """Central coordinator managing all AI agents - Enhanced Aavana 2.0"""
    
    def __init__(self):
        self.agents = {}
        self.task_history = []
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        
        # Initialize coordinator's own AI instance
        self.coordinator_chat = None
        
    async def initialize(self):
        """Initialize all AI agents"""
        # Initialize specialized agents
        self.agents[AgentType.SALES] = SalesAIAgent()
        self.agents[AgentType.MARKETING] = MarketingAIAgent()
        self.agents[AgentType.HR] = HRAIAgent()
        self.agents[AgentType.ERP] = ERPAIAgent()
        self.agents[AgentType.VOICE] = VoiceAIAgent()
        
        # Initialize all agents
        for agent in self.agents.values():
            await agent.initialize()
            
        # Initialize coordinator
        self.coordinator_chat = LlmChat(
            api_key=self.api_key,
            session_id=f"coordinator_{str(uuid.uuid4())[:8]}",
            system_message=self._get_coordinator_system_message()
        ).with_model("openai", "gpt-5")
        
    def _get_coordinator_system_message(self) -> str:
        return """You are Aavana 2.0, the Central AI Coordinator for Aavana Greens CRM.

ROLE: Intelligent task router and multi-agent orchestrator

AVAILABLE SPECIALIZED AGENTS:
1. Sales AI: Lead management, deal editing (pipeline), qualification, conversions
2. Marketing AI: Campaigns, content creation, UGC, brand content, social media
3. HR AI: Employee management, attendance, leave, payroll, performance
4. ERP AI: Inventory, projects, catalogues, batch operations, business processes
5. Voice AI: TTS/STT, voice commands, multilingual support

TASK ROUTING RULES:
- Sales AI: Leads, deals, pipeline, qualification, follow-ups
- Marketing AI: Campaigns, content, social media, email marketing, WhatsApp bulk
- HR AI: Employees, attendance, leave, payroll, performance
- ERP AI: Inventory, projects, catalogues, batch operations, gallery
- Voice AI: Voice interactions, TTS/STT, voice commands

COORDINATION RESPONSIBILITIES:
- Analyze incoming requests and route to appropriate agents
- Combine responses from multiple agents when needed
- Ensure consistent user experience across all interactions
- Maintain context across multi-turn conversations
- Provide fallback responses when agents are unavailable

Always respond in a helpful, professional manner while efficiently routing tasks to the most suitable specialized agent."""
    
    async def process_request(self, message: str, context: Dict = None) -> Dict:
        """Main entry point for processing user requests"""
        try:
            if not self.coordinator_chat:
                await self.initialize()
            
            # Determine task type and route to appropriate agent
            task_type, target_agent = await self._analyze_and_route(message, context)
            
            # Record task
            task_record = {
                "id": str(uuid.uuid4()),
                "message": message,
                "task_type": task_type.value,
                "agent": target_agent.value,
                "timestamp": datetime.now(timezone.utc),
                "context": context
            }
            self.task_history.append(task_record)
            
            # Process with appropriate agent
            if target_agent in self.agents:
                agent_response = await self.agents[target_agent].process_task(message, context)
                
                # Enhance response with coordinator insights
                final_response = await self._enhance_response(agent_response, task_type, context)
                
                return {
                    "success": True,
                    "response": final_response.content,
                    "actions": final_response.actions,
                    "metadata": {
                        **final_response.metadata,
                        "task_id": task_record["id"],
                        "coordinator": "aavana_2.0",
                        "routing": {
                            "task_type": task_type.value,
                            "agent_used": target_agent.value
                        }
                    }
                }
            else:
                # Fallback to coordinator direct response
                coordinator_message = UserMessage(text=message)
                response = await self.coordinator_chat.send_message(coordinator_message)
                
                return {
                    "success": True,
                    "response": response,
                    "actions": [],
                    "metadata": {
                        "task_id": task_record["id"],
                        "coordinator": "aavana_2.0",
                        "routing": {
                            "task_type": "general_chat",
                            "agent_used": "coordinator_direct"
                        }
                    }
                }
                
        except Exception as e:
            return {
                "success": False,
                "response": "I apologize, but I'm experiencing technical difficulties. Please try again or contact support.",
                "error": str(e),
                "metadata": {
                    "coordinator": "aavana_2.0",
                    "error_type": "processing_error"
                }
            }
    
    async def _analyze_and_route(self, message: str, context: Dict = None) -> Tuple[TaskType, AgentType]:
        """Analyze message and determine optimal routing"""
        message_lower = message.lower()
        
        # Sales routing
        if any(keyword in message_lower for keyword in ["lead", "deal", "sales", "pipeline", "qualification", "convert", "follow-up", "prospect"]):
            if any(keyword in message_lower for keyword in ["edit deal", "update deal", "deal edit", "modify deal", "change deal"]):
                return TaskType.DEAL_EDITING, AgentType.SALES
            return TaskType.LEAD_MANAGEMENT, AgentType.SALES
        
        # Marketing routing
        if any(keyword in message_lower for keyword in ["marketing", "campaign", "content", "ugc", "brand", "social", "instagram", "facebook", "email marketing", "whatsapp bulk"]):
            if "content" in message_lower:
                return TaskType.CONTENT_CREATION, AgentType.MARKETING
            return TaskType.MARKETING_CAMPAIGN, AgentType.MARKETING
        
        # HR routing
        if any(keyword in message_lower for keyword in ["employee", "attendance", "leave", "payroll", "hr", "staff", "check-in", "face", "performance"]):
            return TaskType.HR_MANAGEMENT, AgentType.HR
        
        # ERP routing
        if any(keyword in message_lower for keyword in ["inventory", "catalogue", "gallery", "project", "batch", "bulk", "erp", "business", "operations", "send gallery", "send catalogue"]):
            return TaskType.ERP_OPERATIONS, AgentType.ERP
        
        # Voice routing
        if any(keyword in message_lower for keyword in ["voice", "speak", "audio", "tts", "stt", "call", "phone"]):
            return TaskType.VOICE_INTERACTION, AgentType.VOICE
        
        # Default to general chat with coordinator
        return TaskType.GENERAL_CHAT, AgentType.COORDINATOR
    
    async def _enhance_response(self, agent_response: AIAgentResponse, task_type: TaskType, context: Dict = None) -> AIAgentResponse:
        """Enhance agent response with coordinator insights"""
        if not agent_response.success:
            return agent_response
        
        try:
            # Add coordinator enhancement
            enhancement_prompt = f"""
            Task Type: {task_type.value}
            Agent Response: {agent_response.content}
            Context: {json.dumps(context) if context else "None"}
            
            Enhance this response with:
            1. Additional helpful suggestions
            2. Related actions the user might want to take
            3. Proactive recommendations
            
            Keep the original response intact and add value without being verbose.
            """
            
            enhancement_message = UserMessage(text=enhancement_prompt)
            enhancement = await self.coordinator_chat.send_message(enhancement_message)
            
            # Combine original response with enhancement
            enhanced_content = f"{agent_response.content}\n\n💡 **Additional Insights:**\n{enhancement}"
            
            return AIAgentResponse(
                success=True,
                content=enhanced_content,
                actions=agent_response.actions,
                metadata=agent_response.metadata
            )
            
        except Exception:
            # Return original response if enhancement fails
            return agent_response
    
    async def get_agent_status(self) -> Dict:
        """Get status of all agents"""
        status = {
            "coordinator": "active",
            "agents": {}
        }
        
        for agent_type, agent in self.agents.items():
            status["agents"][agent_type.value] = {
                "status": "active" if agent.chat_instance else "inactive",
                "model": agent.model,
                "provider": agent.provider
            }
        
        return status
    
    async def get_task_history(self, limit: int = 10) -> List[Dict]:
        """Get recent task history"""
        return self.task_history[-limit:] if self.task_history else []

# Global instance
multi_ai_coordinator = MultiAICoordinator()

# Convenience functions for easy integration
async def process_ai_request(message: str, context: Dict = None) -> Dict:
    """Main function to process AI requests through the multi-agent system"""
    return await multi_ai_coordinator.process_request(message, context)

async def get_ai_system_status() -> Dict:
    """Get status of the multi-AI system"""
    return await multi_ai_coordinator.get_agent_status()

async def initialize_ai_system():
    """Initialize the multi-AI system"""
    await multi_ai_coordinator.initialize()
    return {"status": "initialized", "message": "Multi-AI system ready"}