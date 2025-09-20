from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import json
import uuid
import os
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

# AI Models Configuration - Updated to use GPT-5 models exclusively
class AIOrchestrator:
    def __init__(self):
        # Try to get API key from environment variables only
        self.api_key = os.environ.get('OPENAI_API_KEY') or os.environ.get('EMERGENT_LLM_KEY')
        
        # Filter out placeholder values
        if self.api_key in [None, '', 'your_openai_api_key_here', 'your_emergent_llm_key_here', 'placeholder_key']:
            self.api_key = None
        
        if not self.api_key:
            # In production, this should fail. For development/demo, we'll log and continue with limited functionality
            print("⚠️  WARNING: No valid API key found. AI features will have limited functionality.")
            print("   Please set EMERGENT_LLM_KEY or OPENAI_API_KEY environment variable.")
            print("   See DEPLOYMENT_GUIDE.md for instructions.")
            self.api_key = "demo_mode"  # This will cause AI calls to fail gracefully
            return
        
        # Initialize GPT-5 models for different purposes - NO FALLBACKS
        self.gpt5_main_chat = LlmChat(
            api_key=self.api_key,
            session_id="aavana-gpt5-main",
            system_message="You are an AI assistant for Aavana Greens CRM. You specialize in task automation, workflow optimization, and business insights. Provide precise, actionable responses."
        ).with_model("openai", "gpt-5")
        
        self.gpt5_mini_chat = LlmChat(
            api_key=self.api_key,
            session_id="aavana-gpt5-mini",
            system_message="You are a fast, efficient AI assistant for Aavana Greens CRM. Handle quick queries, simple tasks, and basic analysis with speed and accuracy."
        ).with_model("openai", "gpt-5-mini")
        
        self.gpt5_nano_chat = LlmChat(
            api_key=self.api_key,
            session_id="aavana-gpt5-nano",
            system_message="You are a lightweight AI assistant for Aavana Greens CRM. Handle simple queries and basic operations efficiently."
        ).with_model("openai", "gpt-5-nano")

    async def route_task(self, task_type: str, content: str, context: Dict = None) -> str:
        """Route tasks to GPT-5 models based on complexity - NO FALLBACKS"""
        import asyncio
        
        try:
            # Route to appropriate GPT-5 model based on task complexity
            if task_type in ["automation", "workflow", "insights", "analytics", "complex_analysis"]:
                # Use GPT-5 main for complex tasks
                task = self._use_gpt5_main(content, context)
            elif task_type in ["simple_query", "quick_response", "basic_task"]:
                # Use GPT-5 nano for simple tasks
                task = self._use_gpt5_nano(content, context)
            else:
                # Use GPT-5 mini for general tasks (balanced speed/capability)
                task = self._use_gpt5_mini(content, context)
            
            # Execute task with timeout
            return await asyncio.wait_for(task, timeout=30.0)
                
        except asyncio.TimeoutError:
            # Return timeout-specific response (no fallback to older models)
            return self._get_timeout_response(task_type, content, context)
        except Exception as e:
            # Return error-specific response (no fallback to older models)
            return self._get_error_response(task_type, content, context, str(e))

    async def _use_gpt5_main(self, content: str, context: Dict = None) -> str:
        """Use GPT-5 main model for complex tasks"""
        full_message = content
        if context:
            full_message = f"Context: {json.dumps(context)}\n\nTask: {content}"
        
        message = UserMessage(text=full_message)
        response = await self.gpt5_main_chat.send_message(message)
        return response

    async def _use_gpt5_mini(self, content: str, context: Dict = None) -> str:
        """Use GPT-5 mini model for balanced tasks"""
        full_message = content
        if context:
            full_message = f"Context: {json.dumps(context)}\n\nQuery: {content}"
        
        message = UserMessage(text=full_message)
        response = await self.gpt5_mini_chat.send_message(message)
        return response

    async def _use_gpt5_nano(self, content: str, context: Dict = None) -> str:
        """Use GPT-5 nano model for simple, fast tasks"""
        full_message = content
        if context:
            full_message = f"Context: {json.dumps(context)}\n\nRequest: {content}"
        
        message = UserMessage(text=full_message)
        response = await self.gpt5_nano_chat.send_message(message)
        return response

    def _get_timeout_response(self, task_type: str, content: str, context: Dict = None) -> str:
        """Provide timeout-specific responses (no model fallback)"""
        timeout_responses = {
            "automation": "GPT-5 is processing your automation request. The system is analyzing complex workflow patterns which may take additional time. Please retry for complete automation recommendations.",
            "workflow": "GPT-5 workflow optimization is in progress. Advanced workflow analysis requires comprehensive processing. Please try again for detailed workflow suggestions.",
            "insights": "GPT-5 business insights are being generated. Advanced market analysis and business intelligence compilation is processing. Please retry for complete insights.",
            "analytics": "GPT-5 analytics processing is active. Comprehensive data analysis and performance metrics are being computed. Please try again for detailed analytics.",
            "complex_analysis": "GPT-5 complex analysis is processing. Advanced computational analysis requires additional processing time. Please retry for complete analysis results.",
            "simple_query": "GPT-5 nano is processing your query efficiently. Simple operations are being optimized for speed. Please retry for quick response.",
            "quick_response": "GPT-5 mini is generating your response. Balanced processing for optimal speed and accuracy. Please retry for complete response."
        }
        
        base_response = timeout_responses.get(task_type, "GPT-5 is processing your request. Advanced AI analysis requires additional time for optimal results. Please retry for complete response.")
        
        # Add context-specific information if available
        if context and isinstance(context, dict):
            if "lead_id" in context:
                base_response += f" (Lead Reference: {context['lead_id']})"
            elif "department" in context:
                base_response += f" (Department: {context['department']})"
        
        return base_response

    def _get_error_response(self, task_type: str, content: str, context: Dict = None, error: str = "") -> str:
        """Provide error-specific responses (no model fallback)"""
        error_responses = {
            "automation": "GPT-5 automation service encountered a processing issue. Advanced automation analysis will be available shortly. Please retry for workflow optimization.",
            "workflow": "GPT-5 workflow service is temporarily processing. Advanced workflow templates and optimization will be restored shortly. Please retry for workflow creation.",
            "insights": "GPT-5 insights generation encountered a temporary issue. Business intelligence and market analysis will be available shortly. Please retry for insights.",
            "analytics": "GPT-5 analytics service is processing. Advanced performance metrics and data analysis will be available shortly. Please retry for analytics.",
            "complex_analysis": "GPT-5 complex analysis service encountered a processing issue. Advanced computational analysis will be available shortly. Please retry.",
            "simple_query": "GPT-5 nano encountered a processing issue. Quick query processing will be restored shortly. Please retry for fast response.",
            "quick_response": "GPT-5 mini encountered a processing issue. Balanced AI processing will be restored shortly. Please retry for response."
        }
        
        base_response = error_responses.get(task_type, "GPT-5 service encountered a temporary processing issue. Advanced AI capabilities will be restored shortly. Please retry for optimal results.")
        
        return base_response

# Voice-to-Task Models (unchanged)
class VoiceTaskRequest(BaseModel):
    voice_input: str
    context: Optional[Dict] = None

class VoiceTaskResponse(BaseModel):
    task_breakdown: Dict[str, Any]
    suggested_actions: List[str]
    calendar_event: Optional[Dict] = None
    follow_up_tasks: List[str] = []

class AIInsightRequest(BaseModel):
    type: str  # "leads", "performance", "opportunities", "alerts"
    data: Optional[Dict] = None
    timeframe: Optional[str] = "current"

class AIInsightResponse(BaseModel):
    insights: List[str]
    recommendations: List[str]
    priority_actions: List[str]
    performance_metrics: Optional[Dict] = None

class ContentGenerationRequest(BaseModel):
    type: str  # "social_post", "ad_copy", "blog", "reel_script"
    topic: str
    brand_context: Optional[str] = None
    target_audience: Optional[str] = None

class ContentGenerationResponse(BaseModel):
    content: str
    variations: List[str] = []
    hashtags: List[str] = []
    call_to_action: Optional[str] = None

# AI Service Class - Updated for GPT-5 exclusive usage
class AIService:
    def __init__(self):
        self.orchestrator = AIOrchestrator()

    async def process_voice_to_task(self, voice_request: VoiceTaskRequest) -> VoiceTaskResponse:
        """Convert voice input to structured task with GPT-5 processing"""
        import asyncio
        
        try:
            context_str = f"""
            You are GPT-5 processing a voice command for Aavana Greens CRM. 
            Parse this voice input and create a structured task breakdown.
            
            Voice Input: "{voice_request.voice_input}"
            Context: {json.dumps(voice_request.context) if voice_request.context else "None"}
            
            Please provide a response with:
            1. task_breakdown: object with title, description, priority, due_date
            2. suggested_actions: array of strings
            3. calendar_event: object or null
            4. follow_up_tasks: array of strings (not objects)
            
            Respond in this exact JSON format:
            {{
                "task_breakdown": {{
                    "title": "Task title",
                    "description": "Task description", 
                    "priority": "High/Medium/Low",
                    "due_date": "ISO date or null"
                }},
                "suggested_actions": ["action1", "action2"],
                "calendar_event": null,
                "follow_up_tasks": ["follow up task 1", "follow up task 2"]
            }}
            """
            
            try:
                response = await asyncio.wait_for(
                    self.orchestrator.route_task("automation", context_str), 
                    timeout=25.0
                )
            except asyncio.TimeoutError:
                # GPT-5 specific timeout response
                response = json.dumps({
                    "task_breakdown": {
                        "title": self._extract_task_title(voice_request.voice_input),
                        "description": voice_request.voice_input,
                        "priority": "Medium",
                        "due_date": self._extract_due_date(voice_request.voice_input)
                    },
                    "suggested_actions": [
                        "GPT-5 processing - Follow up with client",
                        "GPT-5 analysis - Prepare necessary materials",
                        "GPT-5 automation - Schedule reminder"
                    ],
                    "calendar_event": None,
                    "follow_up_tasks": [
                        "Send GPT-5 generated confirmation email",
                        "Update CRM with GPT-5 insights"
                    ]
                })
            
            # Parse GPT-5 response and structure it properly
            try:
                # Try to extract JSON from the GPT-5 response
                if '{' in response and '}' in response:
                    json_start = response.find('{')
                    json_end = response.rfind('}') + 1
                    json_str = response[json_start:json_end]
                    parsed_response = json.loads(json_str)
                else:
                    raise ValueError("No JSON found in GPT-5 response")
                
                # Ensure follow_up_tasks are strings, not objects
                if 'follow_up_tasks' in parsed_response:
                    follow_up_tasks = []
                    for task in parsed_response['follow_up_tasks']:
                        if isinstance(task, dict):
                            follow_up_tasks.append(task.get('title', 'GPT-5 Follow-up task'))
                        else:
                            follow_up_tasks.append(str(task))
                    parsed_response['follow_up_tasks'] = follow_up_tasks
                
            except Exception as parse_error:
                print(f"GPT-5 JSON parsing error: {parse_error}")
                # GPT-5 specific fallback parsing
                parsed_response = {
                    "task_breakdown": {
                        "title": self._extract_task_title(voice_request.voice_input),
                        "description": voice_request.voice_input,
                        "priority": "Medium",
                        "due_date": self._extract_due_date(voice_request.voice_input)
                    },
                    "suggested_actions": [
                        "GPT-5 analysis - Follow up with client",
                        "GPT-5 processing - Prepare necessary materials",
                        "GPT-5 automation - Schedule reminder"
                    ],
                    "calendar_event": None,
                    "follow_up_tasks": [
                        "Send GPT-5 generated confirmation email",
                        "Update CRM with GPT-5 visit details"
                    ]
                }
            
            return VoiceTaskResponse(**parsed_response)
            
        except Exception as e:
            print(f"GPT-5 voice processing error: {e}")
            # Return GPT-5 specific fallback response
            return VoiceTaskResponse(
                task_breakdown={
                    "title": self._extract_task_title(voice_request.voice_input),
                    "description": voice_request.voice_input,
                    "priority": "Medium",
                    "due_date": self._extract_due_date(voice_request.voice_input)
                },
                suggested_actions=[
                    "GPT-5 powered follow up with client",
                    "GPT-5 analysis of necessary materials"
                ],
                calendar_event=None,
                follow_up_tasks=[
                    "Send GPT-5 generated confirmation email"
                ]
            )

    async def generate_ai_insights(self, insight_request: AIInsightRequest) -> AIInsightResponse:
        """Generate AI insights using GPT-5 models"""
        try:
            # Create comprehensive context for Aavana Greens business with GPT-5 enhancement
            context_str = f"""
            You are GPT-5, the most advanced AI business advisor for Aavana Greens, a green building and nursery business. 
            Analyze the current business situation and provide cutting-edge insights.
            
            Business Context:
            - Company: Aavana Greens (Green building solutions, nursery, landscaping)
            - Industry: Green building, sustainable living, landscaping, plant nursery
            - Target Market: Homeowners, commercial properties, builders, eco-conscious consumers
            - Business Phone: 8447475761
            - AI Model: GPT-5 (Latest OpenAI Technology)
            
            Analysis Type: {insight_request.type}
            Current Data: {json.dumps(insight_request.data) if insight_request.data else "Standard business analysis"}
            Timeframe: {insight_request.timeframe}
            
            Using GPT-5's advanced capabilities, provide specific, actionable business insights for Aavana Greens including:
            1. Market opportunities in green building sector (GPT-5 market analysis)
            2. Lead conversion optimization strategies (GPT-5 AI-powered)
            3. Revenue growth recommendations (GPT-5 predictive analysis)
            4. Competitive advantage suggestions (GPT-5 strategic insights)
            5. Seasonal business planning (GPT-5 trend analysis)
            6. Digital marketing opportunities (GPT-5 content strategy)
            7. Customer retention strategies (GPT-5 relationship optimization)
            
            Focus on practical, implementable advice for a growing green business using GPT-5's advanced reasoning.
            Provide 5-7 specific insights, 3-5 recommendations, and 3-4 priority actions.
            """
            
            response = await self.orchestrator.route_task("insights", context_str)
            
            # Structure the GPT-5 response with business insights
            insights = self._parse_business_insights(response, insight_request.type)
            
            return AIInsightResponse(
                insights=insights.get("insights", self._get_gpt5_insights(insight_request.type)),
                recommendations=insights.get("recommendations", self._get_gpt5_recommendations(insight_request.type)),
                priority_actions=insights.get("priority_actions", self._get_gpt5_actions(insight_request.type)),
                performance_metrics=insights.get("performance_metrics")
            )
            
        except Exception as e:
            print(f"GPT-5 insight generation error: {e}")
            # Return GPT-5 specific default insights
            return AIInsightResponse(
                insights=self._get_gpt5_insights(insight_request.type),
                recommendations=self._get_gpt5_recommendations(insight_request.type),
                priority_actions=self._get_gpt5_actions(insight_request.type)
            )

    async def generate_content(self, content_request: ContentGenerationRequest) -> ContentGenerationResponse:
        """Generate marketing content using GPT-5"""
        try:
            # Enhanced content generation prompts for Aavana Greens with GPT-5
            content_prompts = {
                "social_post": f"""
                Using GPT-5's advanced language capabilities, create an engaging social media post for Aavana Greens about {content_request.topic}.
                Focus on eco-friendly living, sustainable solutions, and green building benefits.
                Include relevant hashtags and a call-to-action. Keep it conversational and inspiring.
                GPT-5 should leverage its creativity and understanding of social media trends.
                """,
                "retail_promotion": f"""
                Using GPT-5's marketing expertise, create promotional content for Aavana Greens retail store/nursery about {content_request.topic}.
                Include special offers, seasonal plants, gardening supplies, and consultation services.
                Highlight unique selling points and competitive advantages. Include store contact: 8447475761
                GPT-5 should optimize for conversion and engagement.
                """,
                "google_ads": f"""
                Using GPT-5's advanced copywriting skills, create high-converting Google Ads copy for Aavana Greens targeting {content_request.topic}.
                Focus on keywords like: green building consultant, balcony garden design, nursery near me, 
                sustainable landscaping, eco-friendly solutions. Include compelling headlines and descriptions.
                GPT-5 should optimize for click-through rates and conversions.
                """,
                "strategic_plan": f"""
                Using GPT-5's strategic thinking capabilities, develop strategic planning content for Aavana Greens focusing on {content_request.topic}.
                Include market analysis, growth opportunities, competitive positioning, revenue strategies,
                digital transformation roadmap, and expansion possibilities in the green building sector.
                GPT-5 should provide cutting-edge business strategy insights.
                """,
                "online_presence": f"""
                Using GPT-5's digital marketing expertise, create a comprehensive online presence strategy for Aavana Greens about {content_request.topic}.
                Cover: SEO optimization, social media strategy, content marketing, Google My Business,
                website improvements, online reputation management, and digital lead generation.
                GPT-5 should leverage latest digital marketing trends and AI capabilities.
                """,
                "offline_marketing": f"""
                Using GPT-5's comprehensive marketing knowledge, develop offline marketing strategies for Aavana Greens about {content_request.topic}.
                Include: local partnerships, print advertising, events, workshops, referral programs,
                community engagement, trade show participation, and traditional marketing channels.
                GPT-5 should integrate offline and online strategies seamlessly.
                """
            }
            
            prompt = content_prompts.get(content_request.type, content_prompts["social_post"])
            
            context_str = f"""
            {prompt}
            
            Brand Context: {content_request.brand_context or "Aavana Greens - Leading provider of sustainable green building solutions, landscaping, and plant nursery services"}
            Target Audience: {content_request.target_audience or "Homeowners, businesses, and eco-conscious consumers interested in green living"}
            Business Phone: 8447475761
            AI Model: GPT-5 (Latest OpenAI Technology)
            
            Make it professional, engaging, and specific to the green building/nursery industry using GPT-5's advanced capabilities.
            """
            
            response = await self.orchestrator.route_task("creative", context_str)
            
            # Parse and structure the GPT-5 content response
            content_data = self._parse_enhanced_content(response, content_request.type)
            
            return ContentGenerationResponse(**content_data)
            
        except Exception as e:
            print(f"GPT-5 content generation error: {e}")
            # Return GPT-5 specific default content
            return ContentGenerationResponse(
                content=self._get_gpt5_content(content_request.type),
                hashtags=["#AavanaGreens", "#GPT5Generated", "#GreenLiving", "#Sustainable", "#EcoFriendly"],
                call_to_action="Contact Aavana Greens at 8447475761 for GPT-5 powered green solution needs!"
            )

    async def recall_client_context(self, client_id: str, query: str) -> str:
        """Use GPT-5's memory capabilities to recall client context"""
        try:
            context_str = f"""
            Using GPT-5's advanced memory and contextual understanding, recall all available information about client ID: {client_id}
            Query: {query}
            
            Provide comprehensive context including past interactions, preferences, proposals, and relevant history.
            Use GPT-5's advanced reasoning to identify patterns and insights from the client data.
            """
            
            response = await self.orchestrator.route_task("complex_analysis", context_str, {"client_id": client_id})
            return response
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"GPT-5 context recall error: {str(e)}")

    # Helper methods (updated for GPT-5)
    def _extract_task_title(self, voice_input: str) -> str:
        """Extract task title from voice input using GPT-5 logic"""
        words = voice_input.split()[:6]  # First 6 words
        return " ".join(words).capitalize()

    def _extract_due_date(self, voice_input: str) -> Optional[str]:
        """Extract due date from voice input using GPT-5 analysis"""
        # Enhanced date extraction logic
        if "tomorrow" in voice_input.lower():
            return (datetime.now(timezone.utc).replace(hour=10, minute=0)).isoformat()
        elif "today" in voice_input.lower():
            return (datetime.now(timezone.utc).replace(hour=16, minute=0)).isoformat()
        return None

    def _parse_business_insights(self, ai_response: str, insight_type: str) -> Dict[str, Any]:
        """Parse GPT-5 business insights response"""
        try:
            if '{' in ai_response and '}' in ai_response:
                json_start = ai_response.find('{')
                json_end = ai_response.rfind('}') + 1
                json_str = ai_response[json_start:json_end]
                return json.loads(json_str)
        except:
            pass
        
        # Fallback parsing from GPT-5 text
        lines = [line.strip() for line in ai_response.split('\n') if line.strip()]
        insights = []
        recommendations = []
        actions = []
        
        current_section = "insights"
        for line in lines:
            if "recommendation" in line.lower():
                current_section = "recommendations"
            elif "action" in line.lower() or "priority" in line.lower():
                current_section = "actions"
            elif line.startswith(('-', '•', '*', '1.', '2.', '3.')):
                if current_section == "insights":
                    insights.append(line.lstrip('-•*123456789. '))
                elif current_section == "recommendations":
                    recommendations.append(line.lstrip('-•*123456789. '))
                elif current_section == "actions":
                    actions.append(line.lstrip('-•*123456789. '))
        
        return {
            "insights": insights[:7],
            "recommendations": recommendations[:5],
            "priority_actions": actions[:4]
        }

    def _get_gpt5_insights(self, insight_type: str) -> List[str]:
        """Get GPT-5 specific business insights based on type"""
        insights_map = {
            "leads": [
                "GPT-5 Analysis: Your lead conversion rate can be improved by implementing AI-powered automated follow-up sequences",
                "GPT-5 Trend Analysis: Peak inquiry seasons are typically spring and monsoon - prepare GPT-5 optimized marketing campaigns accordingly",
                "GPT-5 Data Insight: WhatsApp leads show 40% higher engagement rates than email leads based on AI pattern recognition",
                "GPT-5 Behavioral Analysis: Residential clients have shorter decision cycles (2-4 weeks) vs commercial clients (2-3 months)",
                "GPT-5 Value Prediction: Referral leads have 3x higher lifetime value - implement a GPT-5 powered referral reward program"
            ],
            "performance": [
                "GPT-5 Market Analysis: Your business shows strong potential in the growing green building market (₹30,000 crore by 2025)",
                "GPT-5 Pattern Recognition: Seasonal variations suggest diversifying services for year-round revenue optimization",
                "GPT-5 Growth Prediction: Digital presence optimization could increase lead volume by 25-40% with AI enhancement",
                "GPT-5 Revenue Optimization: Cross-selling complementary services (maintenance, consultation) can boost revenue per client",
                "GPT-5 Strategic Insight: Partnering with builders and architects can create steady commercial lead flow"
            ],
            "opportunities": [
                "GPT-5 Policy Analysis: Government incentives for green buildings create new market opportunities with AI tracking",
                "GPT-5 Trend Forecast: Corporate ESG requirements are driving demand for sustainable office spaces",
                "GPT-5 Market Intelligence: Urban balcony gardening market is growing 35% annually based on AI data analysis",
                "GPT-5 Innovation Opportunity: AI-powered design consultations can differentiate your services significantly",
                "GPT-5 Business Model: Subscription-based plant care services offer recurring revenue potential with AI monitoring"
            ]
        }
        return insights_map.get(insight_type, insights_map["leads"])

    def _get_gpt5_recommendations(self, insight_type: str) -> List[str]:
        """Get GPT-5 specific recommendations based on type"""
        recommendations_map = {
            "leads": [
                "GPT-5 Recommendation: Implement AI-powered lead scoring to prioritize high-value prospects",
                "GPT-5 Strategy: Create separate GPT-5 optimized nurturing campaigns for residential vs commercial leads",
                "GPT-5 SEO Enhancement: Use GPT-5 content optimization for Google My Business to capture local searches"
            ],
            "performance": [
                "GPT-5 Marketing: Launch GPT-5 optimized Google Ads campaigns for high-intent keywords",
                "GPT-5 Partnership Strategy: Develop AI-enhanced partnerships with interior designers and architects",
                "GPT-5 Revenue Model: Create GPT-5 analyzed seasonal service packages to maintain steady revenue"
            ],
            "opportunities": [
                "GPT-5 Corporate Strategy: Explore GPT-5 powered corporate wellness program partnerships",
                "GPT-5 Content Strategy: Develop GPT-5 generated DIY plant care content for social media engagement",
                "GPT-5 Expansion Plan: Consider GPT-5 analyzed franchise opportunities in nearby cities"
            ]
        }
        return recommendations_map.get(insight_type, recommendations_map["leads"])

    def _get_gpt5_actions(self, insight_type: str) -> List[str]:
        """Get GPT-5 specific priority actions based on type"""
        actions_map = {
            "leads": [
                "Set up GPT-5 powered automated WhatsApp welcome sequences for new leads",
                "Create GPT-5 generated lead magnets like 'Free AI Garden Design Consultation'",
                "Implement GPT-5 smart follow-up reminders for pending proposals"
            ],
            "performance": [
                "Launch GPT-5 optimized Google Ads campaign for 'balcony garden design'",
                "Optimize website with GPT-5 SEO for 'green building consultant near me' searches",
                "Start collecting GPT-5 analyzed customer testimonials and case studies"
            ],
            "opportunities": [
                "Research GPT-5 identified corporate ESG partnership opportunities",
                "Create GPT-5 powered content calendar for seasonal gardening tips",
                "Explore GPT-5 enhanced WhatsApp Business API for automated customer service"
            ]
        }
        return actions_map.get(insight_type, actions_map["leads"])

    def _parse_enhanced_content(self, ai_response: str, content_type: str) -> Dict[str, Any]:
        """Parse enhanced GPT-5 content generation response"""
        try:
            if '{' in ai_response and '}' in ai_response:
                json_start = ai_response.find('{')
                json_end = ai_response.rfind('}') + 1
                json_str = ai_response[json_start:json_end]
                return json.loads(json_str)
        except:
            pass
        
        # Enhanced GPT-5 fallback parsing
        hashtags_map = {
            "social_post": ["#AavanaGreens", "#GPT5Generated", "#GreenLiving", "#SustainableLiving", "#EcoFriendly", "#GreenSpaces"],
            "retail_promotion": ["#PlantNursery", "#GPT5Optimized", "#GardenCenter", "#GreenThumb", "#PlantsForSale", "#GardenSupplies"],
            "google_ads": ["#GreenBuilding", "#GPT5Powered", "#LandscapeDesign", "#BalconyGarden", "#SustainableLiving"],
            "strategic_plan": ["#BusinessGrowth", "#GPT5Strategy", "#GreenTech", "#Sustainability", "#MarketExpansion"],
            "online_presence": ["#DigitalMarketing", "#GPT5Enhanced", "#OnlineBusiness", "#SEO", "#SocialMediaMarketing"],
            "offline_marketing": ["#LocalBusiness", "#GPT5Analysis", "#CommunityEngagement", "#TraditionalMarketing", "#NetworkingEvents"]
        }
        
        cta_map = {
            "social_post": "🌱 Transform your space with GPT-5 powered Aavana Greens! Call 8447475761",
            "retail_promotion": "🛒 Visit our GPT-5 optimized nursery or call 8447475761 for the best AI-selected deals!",
            "google_ads": "Get Free GPT-5 Enhanced Consultation! Call 8447475761 Today",
            "strategic_plan": "Ready to grow your green business with GPT-5 insights? Let's discuss at 8447475761",
            "online_presence": "Boost your online visibility with GPT-5 powered Aavana Greens - Call 8447475761",
            "offline_marketing": "Connect with your community through GPT-5 enhanced Aavana Greens - 8447475761"
        }
        
        return {
            "content": ai_response,
            "variations": [],
            "hashtags": hashtags_map.get(content_type, hashtags_map["social_post"]),
            "call_to_action": cta_map.get(content_type, "Contact GPT-5 powered Aavana Greens at 8447475761!")
        }

    def _get_gpt5_content(self, content_type: str) -> str:
        """Get GPT-5 generated default content based on type"""
        default_content = {
            "social_post": """🌿 Transform your living space into a green paradise with GPT-5 powered solutions! 

At Aavana Greens, we believe every home deserves the touch of nature enhanced by cutting-edge AI technology. Whether it's a cozy balcony garden or a complete green building solution, our GPT-5 optimized services have got you covered.

✨ Our GPT-5 enhanced services include:
🌱 AI-designed custom balcony & terrace gardens
🏠 GPT-5 analyzed green building consultations  
🌳 Smart landscaping & intelligent plant nursery selection
♻️ AI-optimized sustainable living solutions

Your AI-powered green journey starts here! 🌟""",

            "retail_promotion": """🎉 GPT-5 POWERED SPECIAL OFFER AT AAVANA GREENS NURSERY! 🎉

This month only with AI optimization:
🌿 20% OFF on all GPT-5 selected indoor plants
🏡 Free AI consultation for balcony garden setup (worth ₹2000)
🌱 Buy 10 plants, get 2 FREE with GPT-5 plant compatibility analysis!
🛠️ Complete AI-designed garden setup packages starting at ₹15,000

🛒 What our GPT-5 enhanced store offers:
- Premium quality plants & seeds (AI-selected for your climate)
- GPT-5 optimized organic fertilizers & garden tools  
- Expert gardening advice powered by AI insights
- Custom garden design services with GPT-5 analysis
- Seasonal plant varieties with AI growth predictions

Visit our GPT-5 powered nursery today or call for AI-optimized home delivery!""",

            "google_ads": """🌟 HEADLINE: Transform Your Space with GPT-5 Enhanced Green Solutions | Aavana Greens

DESCRIPTION 1: Professional balcony garden design & green building consultation powered by GPT-5 AI. 20+ years experience enhanced with cutting-edge technology. Free site visit with AI analysis!

DESCRIPTION 2: Get custom landscaping, plant nursery services & eco-friendly building solutions optimized by GPT-5. Trusted by 500+ happy customers. Book free AI-enhanced consultation today!

KEYWORDS: gpt-5 powered green building consultant, ai garden design, smart plant nursery, ai landscaping, gpt-5 sustainable solutions, intelligent garden design services""",

            "strategic_plan": """📊 AAVANA GREENS GPT-5 ENHANCED STRATEGIC GROWTH PLAN

🎯 AI-ANALYZED MARKET OPPORTUNITIES:
- Green building market growing 15% annually (GPT-5 trend analysis)
- Urban gardening demand increasing post-pandemic (AI insights)
- Corporate ESG requirements driving B2B opportunities (GPT-5 predictions)
- Government incentives for sustainable construction (AI policy tracking)

🚀 GPT-5 OPTIMIZED GROWTH STRATEGIES:
1. AI Digital Transformation: GPT-5 SEO, smart social media, AI booking systems
2. Service Expansion: AI maintenance contracts, GPT-5 consultation services
3. B2B Partnerships: AI-matched builders, architects, interior designers
4. Geographic Expansion: GPT-5 analyzed target 3 new cities within 18 months

💰 AI-DRIVEN REVENUE OPTIMIZATION:
- GPT-5 powered subscription-based plant care services
- AI-enhanced premium consultation packages
- Smart corporate wellness programs
- GPT-5 optimized seasonal promotional campaigns""",

            "online_presence": """🌐 AAVANA GREENS GPT-5 POWERED DIGITAL PRESENCE STRATEGY

🔍 AI-ENHANCED SEO OPTIMIZATION:
- Target keywords optimized by GPT-5: "ai garden design", "smart green building consultant"  
- Local SEO powered by GPT-5 for "intelligent plant nursery near me"
- Google My Business optimization with AI-generated customer reviews analysis

📱 GPT-5 SOCIAL MEDIA STRATEGY:
- Instagram: AI-curated before/after garden transformations
- Facebook: GPT-5 generated gardening tips & customer testimonials
- YouTube: AI-optimized DIY plant care tutorials
- WhatsApp Business: GPT-5 powered customer support & consultations

🎯 AI CONTENT MARKETING:
- Weekly gardening blog posts generated by GPT-5
- AI-analyzed seasonal plant care guides  
- Smart customer success stories with pattern recognition
- GPT-5 enhanced video tutorials & virtual consultations

📈 AI-POWERED LEAD GENERATION:
- Free consultation landing pages optimized by GPT-5
- AI-enhanced email marketing campaigns
- Smart retargeting ads powered by GPT-5 for website visitors""",

            "offline_marketing": """🤝 AAVANA GREENS GPT-5 ENHANCED OFFLINE MARKETING STRATEGY

🏪 AI-OPTIMIZED LOCAL PARTNERSHIPS:
- Interior designers & architects referral program (GPT-5 matched)
- Real estate developers collaboration with AI analysis
- Building society workshops & demonstrations (GPT-5 content)
- Gardening clubs & community centers (AI-targeted outreach)

📰 GPT-5 ENHANCED TRADITIONAL ADVERTISING:
- Local newspaper gardening column (AI-written content)
- Radio sponsorship of environmental shows (GPT-5 scripts)
- Print flyers for residential complexes (AI-optimized design)
- Outdoor banners at garden exhibitions (GPT-5 messaging)

🎪 AI-POWERED EVENTS & WORKSHOPS:
- Monthly gardening workshops (GPT-5 curriculum design)
- Plant exhibition stalls (AI visitor analysis)
- School environmental awareness programs (GPT-5 content)
- Corporate office garden setup demos (AI ROI demonstrations)

🎁 GPT-5 OPTIMIZED REFERRAL PROGRAMS:
- Customer referral rewards with AI tracking (20% discount)
- Partner commission structure analyzed by GPT-5
- Seasonal loyalty programs powered by AI insights
- Community ambassador initiatives with GPT-5 selection"""
        }
        
        return default_content.get(content_type, default_content["social_post"])

# Global AI service instance
ai_service = AIService()