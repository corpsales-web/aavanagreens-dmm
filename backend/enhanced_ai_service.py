"""
Enhanced AI Service with GPT-5 Models Exclusive Support
Updated to use GPT-5, GPT-5-mini, and GPT-5-nano exclusively
"""

import os
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    print("emergentintegrations not installed. Installing...")
    import subprocess
    subprocess.run([
        "pip", "install", "emergentintegrations", 
        "--extra-index-url", "https://d33sy5i8bnduwe.cloudfront.net/simple/"
    ])
    from emergentintegrations.llm.chat import LlmChat, UserMessage

class AIProvider:
    """Available AI providers - OpenAI only for GPT-5"""
    OPENAI = "openai"
    
class AIModel:
    """Available GPT-5 models only"""
    # OpenAI GPT-5 Models
    GPT_5 = "gpt-5"
    GPT_5_MINI = "gpt-5-mini"
    GPT_5_NANO = "gpt-5-nano"

class AIRequest(BaseModel):
    """Base AI request model - Updated for GPT-5"""
    prompt: str
    provider: str = AIProvider.OPENAI
    model: str = AIModel.GPT_5
    # temperature: float = 0.7  # Removed as GPT-5 only supports default
    max_tokens: int = 2000
    system_message: Optional[str] = None
    session_id: Optional[str] = None

class AIResponse(BaseModel):
    """AI response model"""
    content: str
    provider: str
    model: str
    tokens_used: Optional[int] = None
    session_id: str
    timestamp: datetime

class EnhancedAIService:
    """Enhanced AI service with GPT-5 models exclusive support"""
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY') or os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key not found in environment variables")
        
        # GPT-5 configurations for different use cases - NO FALLBACKS
        self.model_configs = {
            "creative": {
                "provider": AIProvider.OPENAI,
                "model": AIModel.GPT_5,
                "temperature": 0.8
            },
            "analytical": {
                "provider": AIProvider.OPENAI,
                "model": AIModel.GPT_5,
                "temperature": 0.3
            },
            "conversational": {
                "provider": AIProvider.OPENAI,
                "model": AIModel.GPT_5_MINI,
                "temperature": 0.6
            },
            "business": {
                "provider": AIProvider.OPENAI,
                "model": AIModel.GPT_5,
                "temperature": 0.4
            },
            "quick_tasks": {
                "provider": AIProvider.OPENAI,
                "model": AIModel.GPT_5_NANO,
                "temperature": 0.5
            }
        }
    
    async def generate_response(self, request: AIRequest) -> AIResponse:
        """Generate AI response using GPT-5 models exclusively"""
        try:
            session_id = request.session_id or str(uuid.uuid4())
            
            # Initialize chat with GPT-5 model
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=request.system_message or "You are GPT-5, the most advanced AI assistant for Aavana Greens CRM. Provide intelligent, actionable responses with cutting-edge AI capabilities."
            ).with_model(request.provider, request.model)
            
            # Create user message
            user_message = UserMessage(text=request.prompt)
            
            # Send message and get GPT-5 response
            response = await chat.send_message(user_message)
            
            return AIResponse(
                content=response,
                provider=request.provider,
                model=request.model,
                session_id=session_id,
                timestamp=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            raise Exception(f"GPT-5 response generation failed: {str(e)}")
    
    async def get_optimized_response(self, task_type: str, prompt: str, context: Optional[Dict] = None) -> AIResponse:
        """Get optimized GPT-5 response based on task type"""
        config = self.model_configs.get(task_type, self.model_configs["business"])
        
        # Enhanced system message for GPT-5
        system_messages = {
            "creative": "You are GPT-5, the most advanced creative AI. Generate innovative, engaging content for Aavana Greens with cutting-edge creativity and market understanding.",
            "analytical": "You are GPT-5, the most advanced analytical AI. Provide precise, data-driven insights for Aavana Greens with sophisticated analysis and strategic thinking.",
            "conversational": "You are GPT-5 Mini, optimized for fast, natural conversations. Engage users effectively for Aavana Greens with quick, intelligent responses.",
            "business": "You are GPT-5, the most advanced business AI. Provide strategic business insights for Aavana Greens with comprehensive market understanding and growth strategies.",
            "quick_tasks": "You are GPT-5 Nano, optimized for quick, efficient task completion. Handle simple requests for Aavana Greens with speed and accuracy."
        }
        
        # Add context to prompt if provided
        enhanced_prompt = prompt
        if context:
            enhanced_prompt = f"Context: {json.dumps(context)}\n\nTask: {prompt}"
        
        request = AIRequest(
            prompt=enhanced_prompt,
            provider=config["provider"],
            model=config["model"],
            temperature=config["temperature"],
            system_message=system_messages.get(task_type, system_messages["business"])
        )
        
        return await self.generate_response(request)
    
    async def generate_marketing_content(self, content_type: str, topic: str, target_audience: str = None) -> AIResponse:
        """Generate marketing content using GPT-5"""
        marketing_prompts = {
            "social_post": f"Create an engaging social media post about {topic} for Aavana Greens. Use GPT-5's advanced understanding of social media trends and green building industry.",
            "blog_article": f"Write a comprehensive blog article about {topic} for Aavana Greens. Use GPT-5's expertise in SEO and content marketing.",
            "email_campaign": f"Create an email campaign about {topic} for Aavana Greens. Use GPT-5's persuasive writing and conversion optimization.",
            "ad_copy": f"Create high-converting ad copy about {topic} for Aavana Greens. Use GPT-5's marketing psychology and copywriting expertise.",
            "product_description": f"Write a compelling product description for {topic} at Aavana Greens. Use GPT-5's product marketing and sales expertise."
        }
        
        prompt = marketing_prompts.get(content_type, marketing_prompts["social_post"])
        if target_audience:
            prompt += f" Target audience: {target_audience}"
        
        prompt += "\n\nUse GPT-5's advanced capabilities to create content that drives engagement and conversions."
        
        return await self.get_optimized_response("creative", prompt)
    
    async def analyze_business_data(self, data: Dict, analysis_type: str) -> AIResponse:
        """Analyze business data using GPT-5"""
        analysis_prompts = {
            "lead_analysis": "Analyze the lead data using GPT-5's advanced pattern recognition and provide insights on conversion optimization, lead scoring, and follow-up strategies.",
            "sales_analysis": "Analyze the sales data using GPT-5's business intelligence and provide insights on revenue trends, performance metrics, and growth opportunities.",
            "customer_analysis": "Analyze the customer data using GPT-5's behavioral analysis and provide insights on customer satisfaction, retention strategies, and upselling opportunities.",
            "market_analysis": "Analyze the market data using GPT-5's market intelligence and provide insights on industry trends, competitive positioning, and expansion opportunities."
        }
        
        prompt = f"""
        Using GPT-5's advanced analytical capabilities, {analysis_prompts.get(analysis_type, 'analyze this business data')}
        
        Data: {json.dumps(data)}
        
        Provide:
        1. Key insights with GPT-5 analysis
        2. Actionable recommendations
        3. Strategic implications
        4. Implementation suggestions
        5. Risk assessment with GPT-5 predictions
        """
        
        return await self.get_optimized_response("analytical", prompt, {"data": data})
    
    async def generate_workflow_automation(self, workflow_type: str, requirements: Dict) -> AIResponse:
        """Generate workflow automation using GPT-5"""
        workflow_prompt = f"""
        Using GPT-5's advanced automation and workflow design capabilities, create a comprehensive workflow for {workflow_type} at Aavana Greens.
        
        Requirements: {json.dumps(requirements)}
        
        Design a workflow that includes:
        1. GPT-5 optimized step-by-step process
        2. Automation opportunities with AI integration
        3. Decision points and conditional logic
        4. Performance metrics and KPIs
        5. Integration points with existing systems
        6. Error handling and fallback procedures
        7. Scalability considerations
        
        Use GPT-5's understanding of business processes and AI automation to create an efficient, intelligent workflow.
        """
        
        return await self.get_optimized_response("business", workflow_prompt, requirements)
    
    async def provide_intelligent_recommendations(self, context: str, goals: List[str]) -> AIResponse:
        """Provide intelligent recommendations using GPT-5"""
        recommendation_prompt = f"""
        Using GPT-5's advanced reasoning and strategic thinking capabilities, provide intelligent recommendations for Aavana Greens.
        
        Context: {context}
        Goals: {json.dumps(goals)}
        
        Provide:
        1. Strategic recommendations with GPT-5 analysis
        2. Implementation roadmap
        3. Resource requirements
        4. Expected outcomes and ROI
        5. Risk mitigation strategies
        6. Success metrics
        7. Timeline for implementation
        
        Use GPT-5's comprehensive business knowledge and green industry expertise to provide actionable, data-driven recommendations.
        """
        
        return await self.get_optimized_response("business", recommendation_prompt, {"context": context, "goals": goals})
    
    def get_model_capabilities(self) -> Dict[str, Any]:
        """Get GPT-5 model capabilities and configurations"""
        return {
            "available_models": {
                "gpt-5": {
                    "name": "GPT-5",
                    "description": "Most advanced model for complex tasks, strategic planning, and comprehensive analysis",
                    "best_for": ["complex_analysis", "strategic_planning", "creative_content", "business_intelligence"],
                    "max_tokens": 4000,
                    "speed": "standard"
                },
                "gpt-5-mini": {
                    "name": "GPT-5 Mini",
                    "description": "Balanced model for general tasks with good speed and capability",
                    "best_for": ["conversational", "general_queries", "moderate_analysis", "content_generation"],
                    "max_tokens": 2000,
                    "speed": "fast"
                },
                "gpt-5-nano": {
                    "name": "GPT-5 Nano",
                    "description": "Optimized for quick tasks and simple queries",
                    "best_for": ["quick_responses", "simple_tasks", "basic_queries", "real_time_chat"],
                    "max_tokens": 1000,
                    "speed": "very_fast"
                }
            },
            "use_cases": {
                "creative": "Content creation, marketing materials, social media posts",
                "analytical": "Data analysis, business intelligence, performance metrics",
                "conversational": "Customer interactions, chat responses, Q&A",
                "business": "Strategic planning, recommendations, workflow design",
                "quick_tasks": "Simple queries, basic operations, fast responses"
            },
            "features": [
                "Advanced reasoning and problem-solving",
                "Creative content generation",
                "Business strategy and planning",
                "Data analysis and insights",
                "Workflow automation design",
                "Multi-turn conversations",
                "Context-aware responses",
                "Industry-specific knowledge"
            ]
        }

# Global enhanced AI service instance
enhanced_ai_service = EnhancedAIService()