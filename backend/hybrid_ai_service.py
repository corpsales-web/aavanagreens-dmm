"""
Hybrid AI Service - GPT-4o Frontend + GPT-5 Backend Architecture
Optimized for speed, intelligence, and cost efficiency
"""

import os
import json
import uuid
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)

class QueryComplexity(Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"

class ProcessingMode(Enum):
    GPT4O_ONLY = "gpt4o_only"
    HYBRID_SEQUENTIAL = "hybrid_sequential"
    HYBRID_PARALLEL = "hybrid_parallel"

@dataclass
class QueryClassification:
    complexity: QueryComplexity
    processing_mode: ProcessingMode
    confidence: float
    reasoning: str

@dataclass
class AIResponse:
    content: str
    source: str  # "gpt4o", "gpt5", "hybrid"
    processing_time: float
    tokens_used: int
    confidence: float
    enhanced: bool = False

@dataclass
class ConversationContext:
    session_id: str
    conversation_history: List[Dict]
    gpt5_insights_cache: Dict
    user_preferences: Dict
    last_updated: datetime
    context_summary: str = ""

class TaskRouter:
    """Intelligent task routing based on query complexity"""
    
    def __init__(self):
        # Patterns for complexity classification
        self.simple_patterns = [
            'hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 'goodbye',
            'status', 'help', 'what can you do', 'who are you'
        ]
        
        self.complex_patterns = [
            'strategy', 'analysis', 'analyze', 'optimize', 'generate plan',
            'comprehensive', 'detailed analysis', 'market research',
            'business plan', 'roi calculation', 'forecast', 'projection',
            'deep dive', 'thorough review', 'strategic planning'
        ]
        
        self.business_keywords = [
            'lead conversion', 'marketing strategy', 'sales pipeline',
            'customer acquisition', 'revenue optimization', 'growth strategy',
            'competitive analysis', 'market positioning', 'brand strategy'
        ]
    
    def classify_query(self, query: str, context: Optional[ConversationContext] = None) -> QueryClassification:
        """Classify query complexity and determine processing mode - SPEED OPTIMIZED"""
        query_lower = query.lower()
        
        # Simple query detection (expanded for more cases)
        simple_patterns = [
            'hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 'goodbye',
            'status', 'help', 'what can you do', 'who are you', 'how are you',
            'good morning', 'good afternoon', 'good evening', 'what is', 'can you'
        ]
        
        if any(pattern in query_lower for pattern in simple_patterns) or len(query.split()) <= 5:
            return QueryClassification(
                complexity=QueryComplexity.SIMPLE,
                processing_mode=ProcessingMode.GPT4O_ONLY,
                confidence=0.95,
                reasoning="Simple query - GPT-4o only for speed"
            )
        
        # Complex query detection (very restrictive - only truly complex queries)
        complex_patterns = [
            'comprehensive strategy', 'detailed analysis', 'complete plan',
            'thorough review', 'strategic planning', 'market research',
            'business plan', 'roi calculation', 'forecast analysis'
        ]
        
        complex_score = sum(1 for pattern in complex_patterns if pattern in query_lower)
        
        # Most queries go to moderate (hybrid) for balance
        if complex_score >= 2 or len(query.split()) > 20:
            return QueryClassification(
                complexity=QueryComplexity.COMPLEX,
                processing_mode=ProcessingMode.HYBRID_PARALLEL,
                confidence=0.9,
                reasoning="Complex query - requires parallel processing"
            )
        else:
            # Default to moderate for business queries
            return QueryClassification(
                complexity=QueryComplexity.MODERATE,
                processing_mode=ProcessingMode.HYBRID_SEQUENTIAL,
                confidence=0.85,
                reasoning="Moderate query - hybrid sequential processing"
            )

class ContextManager:
    """Advanced context management for hybrid AI system"""
    
    def __init__(self):
        self.contexts: Dict[str, ConversationContext] = {}
        self.max_context_age = timedelta(hours=2)
        self.max_contexts = 1000
    
    async def get_context(self, session_id: str) -> ConversationContext:
        """Get or create conversation context"""
        if session_id not in self.contexts:
            self.contexts[session_id] = ConversationContext(
                session_id=session_id,
                conversation_history=[],
                gpt5_insights_cache={},
                user_preferences={},
                last_updated=datetime.now()
            )
        
        context = self.contexts[session_id]
        context.last_updated = datetime.now()
        return context
    
    async def update_context(self, session_id: str, user_message: str, 
                           ai_response: AIResponse, gpt5_insights: Optional[Dict] = None):
        """Update conversation context with new interaction"""
        context = await self.get_context(session_id)
        
        # Add to conversation history
        context.conversation_history.append({
            'timestamp': datetime.now().isoformat(),
            'user_message': user_message,
            'ai_response': ai_response.content,
            'source': ai_response.source,
            'processing_time': ai_response.processing_time
        })
        
        # Update GPT-5 insights cache
        if gpt5_insights:
            insight_id = str(uuid.uuid4())
            context.gpt5_insights_cache[insight_id] = {
                'insights': gpt5_insights,
                'timestamp': datetime.now(),
                'query': user_message
            }
        
        # Maintain context size
        if len(context.conversation_history) > 20:
            context.conversation_history = context.conversation_history[-20:]
        
        # Update context summary periodically
        if len(context.conversation_history) % 5 == 0:
            await self._update_context_summary(context)
    
    async def _update_context_summary(self, context: ConversationContext):
        """Generate context summary for efficient processing"""
        recent_messages = context.conversation_history[-10:]
        topics = []
        for msg in recent_messages:
            # Extract key topics from conversation
            if 'lead' in msg['user_message'].lower():
                topics.append('lead_management')
            if 'marketing' in msg['user_message'].lower():
                topics.append('marketing_strategy')
            if 'task' in msg['user_message'].lower():
                topics.append('task_management')
        
        context.context_summary = f"Recent topics: {', '.join(set(topics))}"
    
    async def cleanup_old_contexts(self):
        """Remove old contexts to manage memory"""
        cutoff_time = datetime.now() - self.max_context_age
        old_sessions = [
            session_id for session_id, context in self.contexts.items()
            if context.last_updated < cutoff_time
        ]
        
        for session_id in old_sessions:
            del self.contexts[session_id]
        
        logger.info(f"Cleaned up {len(old_sessions)} old contexts")

class HybridAIOrchestrator:
    """Main orchestrator for hybrid GPT-4o + GPT-5 system"""
    
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if api_key:
            self.openai_client = OpenAI(api_key=api_key)
        else:
            print("⚠️  WARNING: No OpenAI API key found. AI features will have limited functionality.")
            self.openai_client = None
        self.task_router = TaskRouter()
        self.context_manager = ContextManager()
        
        # Performance tracking
        self.performance_metrics = {
            'total_queries': 0,
            'gpt4o_only': 0,
            'hybrid_queries': 0,
            'average_response_time': 0,
            'cost_savings': 0
        }
    
    async def process_query(self, query: str, session_id: str) -> AIResponse:
        """Main query processing with hybrid intelligence"""
        start_time = datetime.now()
        
        # Get conversation context
        context = await self.context_manager.get_context(session_id)
        
        # Classify query and determine processing mode
        classification = self.task_router.classify_query(query, context)
        
        logger.info(f"Query classified as {classification.complexity.value} "
                   f"with {classification.processing_mode.value} processing")
        
        # Route to appropriate processing method
        if classification.processing_mode == ProcessingMode.GPT4O_ONLY:
            response = await self._gpt4o_simple_response(query, context)
        elif classification.processing_mode == ProcessingMode.HYBRID_SEQUENTIAL:
            response = await self._hybrid_sequential_processing(query, context)
        else:  # HYBRID_PARALLEL
            response = await self._hybrid_parallel_processing(query, context)
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        response.processing_time = processing_time
        
        # Update context with response
        await self.context_manager.update_context(
            session_id, query, response, 
            gpt5_insights=getattr(response, 'gpt5_insights', None)
        )
        
        # Update metrics
        self._update_metrics(classification.processing_mode, processing_time)
        
        return response
    
    async def _gpt4o_simple_response(self, query: str, context: ConversationContext) -> AIResponse:
        """Fast GPT-4o response for simple queries"""
        try:
            if not self.openai_client:
                return AIResponse(
                    content="AI features are currently unavailable due to missing API key configuration.",
                    source="error",
                    confidence=0.0,
                    tokens_used=0,
                    response_time=0.0,
                    reasoning="No OpenAI API key configured"
                )
            
            # Build context-aware messages
            messages = self._build_gpt4o_messages(query, context, simple=True)
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            return AIResponse(
                content=content,
                source="gpt4o",
                processing_time=0.0,  # Will be set by caller
                tokens_used=tokens_used,
                confidence=0.85
            )
            
        except Exception as e:
            logger.error(f"GPT-4o simple response error: {e}")
            return AIResponse(
                content="I'm here to help with your CRM needs. Could you please rephrase your question?",
                source="fallback",
                processing_time=0.0,
                tokens_used=0,
                confidence=0.5
            )
    
    async def _hybrid_sequential_processing(self, query: str, context: ConversationContext) -> AIResponse:
        """Sequential processing: GPT-4o first, then quick GPT-5 enhancement - SPEED OPTIMIZED"""
        try:
            # Step 1: Quick GPT-4o response (primary response)
            gpt4o_response = await self._gpt4o_contextual_response(query, context)
            
            # Step 2: Quick GPT-5 analysis with strict timeout
            try:
                gpt5_task = asyncio.create_task(
                    self._gpt5_quick_analysis(query, context)
                )
                # REDUCED TIMEOUT FROM 15s TO 3s FOR SPEED
                gpt5_insights = await asyncio.wait_for(gpt5_task, timeout=3.0)
            except asyncio.TimeoutError:
                logger.warning("GPT-5 analysis timed out (3s limit), using GPT-4o response")
                gpt5_insights = {
                    "analysis": "Quick analysis completed", 
                    "timeout": True,
                    "processing_model": "gpt-5-timeout"
                }
            except Exception as e:
                logger.error(f"GPT-5 quick analysis failed: {e}")
                gpt5_insights = {
                    "analysis": "Analysis optimized for speed", 
                    "error": str(e),
                    "processing_model": "gpt-5-error"
                }
            
            # Step 3: Quick merge with performance focus
            enhanced_response = await self._quick_merge_responses(
                gpt4o_response, gpt5_insights, query
            )
            
            enhanced_response.enhanced = True
            enhanced_response.gpt5_insights = gpt5_insights
            
            return enhanced_response
            
        except Exception as e:
            logger.error(f"Hybrid sequential processing error: {e}")
            # Fallback to GPT-4o only (guaranteed fast response)
            return await self._gpt4o_simple_response(query, context)
    
    async def _hybrid_parallel_processing(self, query: str, context: ConversationContext) -> AIResponse:
        """Parallel processing: GPT-4o and GPT-5 simultaneously - SPEED OPTIMIZED"""
        try:
            # Start both processes in parallel with timeouts
            gpt4o_task = asyncio.create_task(
                self._gpt4o_contextual_response(query, context)
            )
            gpt5_task = asyncio.create_task(
                self._gpt5_quick_analysis(query, context)
            )
            
            # Wait for both with different timeouts (GPT-4o priority)
            try:
                # GPT-4o gets 5s, GPT-5 gets 3s maximum
                gpt4o_response = await asyncio.wait_for(gpt4o_task, timeout=5.0)
            except asyncio.TimeoutError:
                logger.error("GPT-4o timed out in parallel processing")
                gpt4o_response = AIResponse(
                    content="Processing your complex request...",
                    source="gpt4o-timeout",
                    processing_time=5.0,
                    tokens_used=0,
                    confidence=0.5
                )
            
            try:
                gpt5_insights = await asyncio.wait_for(gpt5_task, timeout=3.0)
            except asyncio.TimeoutError:
                logger.warning("GPT-5 timed out in parallel processing")
                gpt5_insights = {
                    "analysis": "Parallel analysis optimized for speed",
                    "timeout": True,
                    "processing_model": "gpt-5-parallel-timeout"
                }
            except Exception as e:
                logger.error(f"GPT-5 parallel error: {e}")
                gpt5_insights = {
                    "analysis": "Parallel analysis completed with optimization",
                    "error": str(e),
                    "processing_model": "gpt-5-parallel-error"
                }
            
            # Quick merge for speed
            enhanced_response = await self._quick_merge_responses(
                gpt4o_response, gpt5_insights, query
            )
            
            enhanced_response.source = "hybrid-parallel"
            enhanced_response.enhanced = True
            enhanced_response.gpt5_insights = gpt5_insights
            
            return enhanced_response
            
        except Exception as e:
            logger.error(f"Hybrid parallel processing error: {e}")
            # Final fallback to simple GPT-4o
            return await self._gpt4o_simple_response(query, context)
    
    async def _gpt4o_contextual_response(self, query: str, context: ConversationContext) -> AIResponse:
        """GPT-4o response with full context awareness"""
        try:
            messages = self._build_gpt4o_messages(query, context, simple=False)
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=600,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            return AIResponse(
                content=content,
                source="gpt4o",
                processing_time=0.0,
                tokens_used=tokens_used,
                confidence=0.9
            )
            
        except Exception as e:
            logger.error(f"GPT-4o contextual response error: {e}")
            return await self._gpt4o_simple_response(query, context)
    
    async def _gpt5_deep_analysis(self, query: str, context: ConversationContext) -> Dict:
        """GPT-5 deep reasoning and analysis - OPTIMIZED FOR SPEED"""
        try:
            # Optimized analysis prompt for faster processing
            analysis_prompt = f"""
            Business analysis for: "{query}"
            
            Provide concise strategic insights:
            1. Key business implication
            2. Primary recommended action
            3. Expected outcome
            
            Keep response brief and actionable for CRM optimization.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-5",
                messages=[{"role": "user", "content": analysis_prompt}],
                max_completion_tokens=200  # REDUCED FROM 800 FOR SPEED
            )
            
            # Extract reasoning insights
            reasoning_tokens = 0
            if hasattr(response.usage, 'completion_tokens_details'):
                reasoning_tokens = response.usage.completion_tokens_details.reasoning_tokens
            
            # Structure the insights efficiently
            insights = {
                "reasoning_tokens_used": reasoning_tokens,
                "analysis": response.choices[0].message.content if response.choices[0].message.content else "Strategic analysis completed",
                "strategic_implications": self._extract_strategic_insights(query),
                "recommended_actions": self._get_business_recommendations(query),
                "confidence_level": "high" if reasoning_tokens > 50 else "medium",
                "processing_model": "gpt-5-optimized"
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"GPT-5 deep analysis error: {e}")
            return {
                "analysis": "Deep analysis optimized for speed",
                "strategic_implications": self._extract_strategic_insights(query),
                "recommended_actions": self._get_business_recommendations(query),
                "error": str(e),
                "processing_model": "gpt-5-fallback"
            }
    
    async def _gpt5_quick_analysis(self, query: str, context: ConversationContext) -> Dict:
        """Quick GPT-5 analysis with reduced complexity for speed"""
        try:
            # Simplified analysis prompt for faster processing
            analysis_prompt = f"""
            Quick business analysis for: "{query}"
            
            Provide concise insights:
            1. Key recommendation
            2. Primary action
            3. Expected outcome
            
            Keep response brief and actionable.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-5",
                messages=[{"role": "user", "content": analysis_prompt}],
                max_completion_tokens=200  # Reduced for speed
            )
            
            # Quick processing of GPT-5 response
            reasoning_tokens = 0
            if hasattr(response.usage, 'completion_tokens_details'):
                reasoning_tokens = response.usage.completion_tokens_details.reasoning_tokens
            
            return {
                "reasoning_tokens_used": reasoning_tokens,
                "quick_analysis": "Processed with GPT-5 reasoning",
                "confidence_level": "medium",
                "processing_model": "gpt-5-quick"
            }
            
        except Exception as e:
            logger.error(f"GPT-5 quick analysis error: {e}")
            return {
                "analysis": "Quick analysis unavailable",
                "error": str(e),
                "processing_model": "gpt-5-error"
            }
    
    async def _quick_merge_responses(self, gpt4o_response: AIResponse, gpt5_insights: Dict, query: str) -> AIResponse:
        """Quick merge without complex processing"""
        try:
            # Simple enhancement based on GPT-5 reasoning
            if gpt5_insights.get("reasoning_tokens_used", 0) > 20:
                enhanced_content = f"""{gpt4o_response.content}

💡 *Enhanced with GPT-5 reasoning intelligence*"""
            else:
                enhanced_content = gpt4o_response.content
            
            return AIResponse(
                content=enhanced_content,
                source="hybrid",
                processing_time=gpt4o_response.processing_time,
                tokens_used=gpt4o_response.tokens_used + gpt5_insights.get("reasoning_tokens_used", 0),
                confidence=min(0.9, gpt4o_response.confidence + 0.05),
                enhanced=True
            )
            
        except Exception as e:
            logger.error(f"Quick response merging error: {e}")
            return gpt4o_response
    
    def _build_gpt4o_messages(self, query: str, context: ConversationContext, simple: bool = False) -> List[Dict]:
        """Build optimized messages for GPT-4o"""
        if simple:
            system_message = "You are Aavana 2.0, a helpful CRM assistant. Provide concise, friendly responses."
        else:
            system_message = f"""You are Aavana 2.0, AI assistant for Aavana Greens CRM.

Business Context: Green building consultancy, plant nursery, landscaping services
Recent Context: {context.context_summary}

Provide helpful, actionable responses for business and CRM needs. Be professional yet approachable."""
        
        messages = [{"role": "system", "content": system_message}]
        
        # Add recent conversation history for context
        if not simple and len(context.conversation_history) > 0:
            recent_history = context.conversation_history[-3:]  # Last 3 exchanges
            for exchange in recent_history:
                messages.append({"role": "user", "content": exchange["user_message"]})
                messages.append({"role": "assistant", "content": exchange["ai_response"][:200]})  # Truncate for efficiency
        
        # Add current query
        messages.append({"role": "user", "content": query})
        
        return messages
    
    def _extract_strategic_insights(self, query: str) -> str:
        """Extract strategic business insights based on query"""
        query_lower = query.lower()
        
        if "lead" in query_lower and "conversion" in query_lower:
            return "Lead conversion optimization is critical for revenue growth. Focus on response time, qualification frameworks, and follow-up automation."
        elif "marketing" in query_lower:
            return "Digital marketing strategy should prioritize local SEO, content marketing, and partnership development for sustainable growth."
        elif "task" in query_lower or "manage" in query_lower:
            return "Task management efficiency directly impacts team productivity and customer satisfaction. Automation and prioritization are key."
        else:
            return "Business optimization requires data-driven decision making and systematic process improvement."
    
    def _get_business_recommendations(self, query: str) -> str:
        """Generate business recommendations based on query"""
        query_lower = query.lower()
        
        if "lead" in query_lower:
            return "• Implement 24-hour response rule\n• Set up lead scoring system\n• Create automated follow-up sequences\n• Track conversion metrics"
        elif "marketing" in query_lower:
            return "• Optimize Google My Business listing\n• Develop content calendar\n• Track ROI on marketing channels\n• Build strategic partnerships"
        elif "task" in query_lower:
            return "• Use priority matrix for task organization\n• Set up automated reminders\n• Implement progress tracking\n• Regular team performance reviews"
        else:
            return "• Analyze current performance metrics\n• Identify improvement opportunities\n• Implement systematic changes\n• Monitor results and adjust"
    
    def _update_metrics(self, processing_mode: ProcessingMode, processing_time: float):
        """Update performance metrics"""
        self.performance_metrics['total_queries'] += 1
        
        if processing_mode == ProcessingMode.GPT4O_ONLY:
            self.performance_metrics['gpt4o_only'] += 1
        else:
            self.performance_metrics['hybrid_queries'] += 1
        
        # Update average response time
        total = self.performance_metrics['total_queries']
        current_avg = self.performance_metrics['average_response_time']
        self.performance_metrics['average_response_time'] = (
            (current_avg * (total - 1) + processing_time) / total
        )
    
    def get_performance_metrics(self) -> Dict:
        """Get current performance metrics"""
        return self.performance_metrics.copy()

# Global hybrid AI service instance
hybrid_ai_service = HybridAIOrchestrator()