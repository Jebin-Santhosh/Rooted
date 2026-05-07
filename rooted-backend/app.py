"""
RootED Backend - Intelligent Agentic RAG System for Dental Education
A truly agentic chatbot with dynamic planning, iterative search, and self-evaluation.
"""

import os
import json
import re
import base64
from typing import Dict, List, Any, TypedDict, Annotated, Optional, Literal
from datetime import datetime
import asyncio
from pathlib import Path
import requests

from fastapi import UploadFile, File
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from langchain_community.llms import Ollama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
import chromadb

#API Key
from dotenv import load_dotenv

load_dotenv()

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, firestore


# Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
OLLAMA_VISION_MODEL = os.getenv("OLLAMA_VISION_MODEL", "llava")
OLLAMA_STARTUP_RETRIES = int(os.getenv("OLLAMA_STARTUP_RETRIES", "3"))
OLLAMA_STARTUP_RETRY_DELAY_SECONDS = float(os.getenv("OLLAMA_STARTUP_RETRY_DELAY_SECONDS", "1.5"))
DATA_PATH = os.getenv("DATA_PATH", "/data")
INDEX_PATH = os.getenv("INDEX_PATH", "/rooted-backend/index.json")

# Agent Configuration
MAX_RESEARCH_ITERATIONS = 5
MIN_CONFIDENCE_THRESHOLD = 0.7

# Initialize FastAPI
app = FastAPI(
    title="RootED API",
    description="Intelligent Agentic Dental Education System with Deep Research",
    version="3.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (fallback)
conversation_memory: Dict[str, List[Dict[str, str]]] = {}
document_index: Dict = {}

# Firebase Firestore client
db = None

def init_firebase():
    """Initialize Firebase Admin SDK."""
    global db
    try:
        # Check if already initialized
        if not firebase_admin._apps:
            # Check multiple possible paths for credentials
            possible_paths = [
                os.getenv("FIREBASE_CREDENTIALS_PATH", ""),
                "/rooted-backend/firebase-credentials.json",  # Docker path
                os.path.join(os.path.dirname(__file__), "firebase-credentials.json"),  # Local dev
                os.path.join(os.path.dirname(__file__), "rooted.json"),  # Alternative name
            ]

            firebase_creds_path = None
            for path in possible_paths:
                if path and os.path.exists(path):
                    firebase_creds_path = path
                    break

            if firebase_creds_path:
                cred = credentials.Certificate(firebase_creds_path)
                firebase_admin.initialize_app(cred)
                print(f"Firebase initialized with credentials from {firebase_creds_path}")
            else:
                # Try default credentials (GCP environment)
                firebase_admin.initialize_app()
                print("Firebase initialized with default credentials")

        db = firestore.client()
        print("Firestore client initialized successfully")
        return True
    except Exception as e:
        print(f"Firebase initialization failed: {e}")
        print("Conversations will be stored in memory only")
        return False


# ============================================
# Firebase Conversation Storage
# ============================================

async def save_conversation_to_firebase(
    user_id: str,
    conversation_id: str,
    user_message: str,
    assistant_message: str,
    research_mode: str = "quick",
    sources: List[str] = None
):
    """Save a conversation exchange to Firebase Firestore."""
    if not db:
        return False

    try:
        conv_ref = db.collection('conversations').document(conversation_id)
        conv_doc = conv_ref.get()

        now = datetime.utcnow()

        # Create message objects
        user_msg = {
            "id": f"msg_{int(now.timestamp() * 1000)}_{os.urandom(4).hex()}",
            "role": "user",
            "content": user_message,
            "timestamp": int(now.timestamp() * 1000)
        }

        assistant_msg = {
            "id": f"msg_{int(now.timestamp() * 1000) + 1}_{os.urandom(4).hex()}",
            "role": "assistant",
            "content": assistant_message,
            "timestamp": int(now.timestamp() * 1000) + 1,
            "researchMode": research_mode
        }
        if sources:
            assistant_msg["sources"] = sources

        if conv_doc.exists:
            # Append to existing conversation
            current_data = conv_doc.to_dict()
            messages = current_data.get('messages', [])
            messages.extend([user_msg, assistant_msg])

            conv_ref.update({
                'messages': messages,
                'messageCount': len(messages),
                'lastMessage': assistant_message[:100],
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
        else:
            # Create new conversation
            title = user_message[:50] + ('...' if len(user_message) > 50 else '')
            conv_ref.set({
                'userId': user_id,
                'title': title,
                'messages': [user_msg, assistant_msg],
                'messageCount': 2,
                'lastMessage': assistant_message[:100],
                'isArchived': False,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })

        return True
    except Exception as e:
        print(f"Error saving to Firebase: {e}")
        return False


async def update_user_progress(user_id: str, messages_added: int = 0, conversations_added: int = 0):
    """Update user learning progress in Firebase."""
    if not db or not user_id:
        return False

    try:
        progress_ref = db.collection('users').document(user_id).collection('progress').document('stats')
        progress_doc = progress_ref.get()

        today = datetime.utcnow().strftime('%Y-%m-%d')
        day_of_week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][datetime.utcnow().weekday()]

        if progress_doc.exists:
            current = progress_doc.to_dict()

            # Calculate streak
            last_active = current.get('lastActiveDate')
            streak = current.get('learningStreak', 0)

            if last_active:
                last_date = datetime.strptime(last_active, '%Y-%m-%d')
                today_date = datetime.strptime(today, '%Y-%m-%d')
                diff_days = (today_date - last_date).days

                if diff_days == 1:
                    streak += 1
                elif diff_days > 1:
                    streak = 1
            else:
                streak = 1

            # Update weekly activity
            weekly = current.get('weeklyActivity', {})
            weekly[day_of_week] = weekly.get(day_of_week, 0) + messages_added

            progress_ref.update({
                'totalMessages': current.get('totalMessages', 0) + messages_added,
                'totalConversations': current.get('totalConversations', 0) + conversations_added,
                'learningStreak': streak,
                'lastActiveDate': today,
                'weeklyActivity': weekly,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
        else:
            # Create new progress document
            progress_ref.set({
                'totalMessages': messages_added,
                'totalConversations': conversations_added,
                'learningStreak': 1,
                'lastActiveDate': today,
                'weeklyActivity': {day_of_week: messages_added},
                'topicsExplored': [],
                'quizzesTaken': 0,
                'quizzesCorrect': 0,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })

        return True
    except Exception as e:
        print(f"Error updating progress: {e}")
        return False


# ============================================
# Document Index Management
# ============================================

def load_document_index() -> Dict:
    """Load the document index from JSON file."""
    global document_index
    try:
        with open(INDEX_PATH, 'r') as f:
            document_index = json.load(f)
            print(f"Loaded document index: {len(document_index.get('collections', {}))} collections")
    except FileNotFoundError:
        print(f"Warning: Index file not found at {INDEX_PATH}")
        document_index = {"collections": {}}
    except Exception as e:
        print(f"Error loading index: {e}")
        document_index = {"collections": {}}
    return document_index


def get_knowledge_base_description() -> str:
    """Get detailed description of available knowledge for the agent."""
    if not document_index.get("collections"):
        return "No documents available."

    desc = []
    for coll_name, coll_data in document_index["collections"].items():
        for doc in coll_data.get("documents", []):
            desc.append(f"""
Document: {doc['title']}
Subject: {doc['subject']}
Description: {doc.get('description', 'N/A')}
Topics covered: {', '.join(doc.get('covers', [])[:10])}
Keywords: {', '.join(doc.get('keywords', [])[:15])}
""")
    return "\n".join(desc) if desc else "No documents indexed."


# ============================================
# ChromaDB Search Functions
# ============================================

def search_knowledge_base(
    query: str,
    n_results: int = 5,
    collection_name: str = "general"
) -> List[Dict[str, Any]]:
    """Search documents in ChromaDB."""
    if not document_index.get("collections"):
        return []

    collection_data = document_index["collections"].get(collection_name, {})
    documents = collection_data.get("documents", [])
    if not documents:
        return []

    results = []
    for doc in documents:
        chroma_path = doc.get("chroma_path")
        if not chroma_path or not Path(chroma_path).exists():
            continue

        try:
            db = chromadb.PersistentClient(path=chroma_path)
            collection = db.get_collection(name="documents")
            search_results = collection.query(
                query_texts=[query],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )

            for content, metadata, distance in zip(
                search_results["documents"][0],
                search_results["metadatas"][0],
                search_results["distances"][0]
            ):
                results.append({
                    "content": content,
                    "page": metadata.get("page", "?"),
                    "title": doc["title"],
                    "relevance": round(1 - distance, 3),
                    "source": f"{doc['title']}, Page {metadata.get('page', '?')}"
                })
        except Exception as e:
            print(f"Search error: {e}")
            continue

    results.sort(key=lambda x: x["relevance"], reverse=True)
    return results[:n_results]


# ============================================
# Agentic State Definition
# ============================================

class ResearchState(TypedDict):
    """State for the intelligent research agent."""
    messages: Annotated[List[BaseMessage], add_messages]
    user_id: str
    session_id: str

    # Research planning
    original_question: str
    research_plan: Optional[Dict[str, Any]]

    # Iterative research
    iteration: int
    search_history: List[Dict[str, Any]]
    accumulated_knowledge: List[Dict[str, Any]]

    # Evaluation
    confidence_score: float
    knowledge_gaps: List[str]
    is_complete: bool

    # Final output
    thinking_process: List[str]
    final_answer: Optional[str]


# ============================================
# Helper Functions
# ============================================

def messages_to_dict(messages: List[BaseMessage]) -> List[Dict[str, str]]:
    result = []
    for msg in messages:
        if isinstance(msg, HumanMessage):
            result.append({"role": "human", "content": msg.content})
        elif isinstance(msg, AIMessage):
            result.append({"role": "ai", "content": msg.content})
        elif isinstance(msg, SystemMessage):
            result.append({"role": "system", "content": msg.content})
    return result


def dict_to_messages(dict_list: List[Dict[str, str]]) -> List[BaseMessage]:
    result = []
    for item in dict_list:
        if item["role"] == "human":
            result.append(HumanMessage(content=item["content"]))
        elif item["role"] == "ai":
            result.append(AIMessage(content=item["content"]))
        elif item["role"] == "system":
            result.append(SystemMessage(content=item["content"]))
    return result


class OllamaLLMAdapter:
    """Adapter that provides a chat-like invoke interface over Ollama LLM."""

    def __init__(self, temperature: float = 0.7):
        self.llm = Ollama(
            model=OLLAMA_MODEL,
            base_url=OLLAMA_BASE_URL,
            temperature=temperature,
        )

    def _serialize_messages(self, messages: List[BaseMessage]) -> str:
        chunks: List[str] = []
        for msg in messages:
            role = "User"
            if isinstance(msg, SystemMessage):
                role = "System"
            elif isinstance(msg, AIMessage):
                role = "Assistant"
            content = msg.content if isinstance(msg.content, str) else json.dumps(msg.content)
            chunks.append(f"{role}: {content}")
        return "\n\n".join(chunks)

    def invoke(self, input_data: Any) -> AIMessage:
        if isinstance(input_data, list):
            prompt = self._serialize_messages(input_data)
        else:
            prompt = str(input_data)
        response_text = self.llm.invoke(prompt)
        if not isinstance(response_text, str):
            response_text = str(response_text)
        return AIMessage(content=response_text)


def get_llm(temperature: float = 0.7) -> OllamaLLMAdapter:
    """Get configured local Ollama LLM instance."""
    return OllamaLLMAdapter(temperature=temperature)


async def check_ollama_ready() -> None:
    """
    Validate Ollama connectivity and model availability at startup.
    Raises RuntimeError if checks fail after retries.
    """
    last_error: Optional[Exception] = None

    for attempt in range(1, OLLAMA_STARTUP_RETRIES + 1):
        try:
            llm = get_llm(temperature=0.0)
            probe = llm.invoke("Reply with exactly: OK")
            if not probe.content or not probe.content.strip():
                raise RuntimeError("Ollama returned an empty probe response")
            print(f"Ollama readiness check passed (attempt {attempt})")
            return
        except Exception as exc:
            last_error = exc
            if attempt < OLLAMA_STARTUP_RETRIES:
                print(
                    f"Ollama readiness check failed (attempt {attempt}/{OLLAMA_STARTUP_RETRIES}): {exc}. "
                    f"Retrying in {OLLAMA_STARTUP_RETRY_DELAY_SECONDS}s..."
                )
                await asyncio.sleep(OLLAMA_STARTUP_RETRY_DELAY_SECONDS)

    raise RuntimeError(
        f"Ollama startup check failed after {OLLAMA_STARTUP_RETRIES} attempts "
        f"(base_url={OLLAMA_BASE_URL}, model={OLLAMA_MODEL}): {last_error}"
    )


def build_dental_context(query: str, n_results: int = 5) -> str:
    """Build concise dental PDF context for the user query."""
    snippets = search_knowledge_base(query=query, n_results=n_results)
    if not snippets:
        return "No indexed dental PDF passages were found for this query."

    context_lines = []
    for i, item in enumerate(snippets, start=1):
        context_lines.append(
            f"[{i}] Source: {item.get('source', 'Unknown')}\n"
            f"Content: {item.get('content', '').strip()}"
        )
    return "\n\n".join(context_lines)


def generate_response(query: str) -> str:
    """
    Generate a production-ready response using local Ollama (Llama3)
    and dental PDF context from the knowledge base.
    """
    context = build_dental_context(query=query, n_results=6)
    llm = get_llm(temperature=0.2)
    prompt = f"""You are RootED, an expert dental assistant.

Answer the user's query using the provided dental context.
If context is incomplete, state uncertainty clearly and provide safe guidance.
Do not fabricate citations or clinical certainty.

Dental Context:
{context}

User Query:
{query}

Response:
"""
    return llm.invoke(prompt).content.strip()


def parse_json_response(response: str) -> Dict:
    """Safely parse JSON from LLM response."""
    try:
        # Handle markdown code blocks
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0]
        elif "```" in response:
            response = response.split("```")[1].split("```")[0]
        return json.loads(response.strip())
    except:
        return {}


# ============================================
# Agent Nodes - Intelligent Research Pipeline
# ============================================

async def plan_research_node(state: ResearchState) -> ResearchState:
    """
    PLANNER: Analyzes the question and creates a dynamic research strategy.
    This is NOT hardcoded - it reasons about what information is needed.
    """
    llm = get_llm(temperature=0.2)
    question = state["original_question"]
    knowledge_base = get_knowledge_base_description()

    planning_prompt = f"""You are a research planning agent for dental education. Analyze this question and create a research strategy.

QUESTION: {question}

AVAILABLE KNOWLEDGE BASE:
{knowledge_base}

Your task:
1. Understand what the student is really asking (identify the core concepts)
2. Break down the question into sub-topics that need to be researched
3. Determine the type of answer needed (factual, comparative, procedural, conceptual)
4. Plan the search queries that will find the most relevant information

Think step by step:
- What are the key dental concepts in this question?
- What related topics should I also search for context?
- What depth of information is needed?
- Are there multiple aspects to compare or explain?

Respond in JSON:
{{
    "question_type": "factual|comparative|procedural|conceptual|multi_part",
    "core_concepts": ["concept1", "concept2"],
    "sub_questions": ["specific aspect 1", "specific aspect 2"],
    "search_queries": ["optimized query 1", "optimized query 2", "optimized query 3"],
    "expected_sections": ["section1", "section2"],
    "depth_required": "basic|moderate|comprehensive",
    "reasoning": "your analysis of what's needed"
}}"""

    response = llm.invoke([HumanMessage(content=planning_prompt)])
    plan = parse_json_response(response.content)

    # Fallback if parsing fails
    if not plan:
        plan = {
            "question_type": "conceptual",
            "core_concepts": [question],
            "sub_questions": [question],
            "search_queries": [question],
            "expected_sections": ["overview", "details"],
            "depth_required": "moderate",
            "reasoning": "Direct search fallback"
        }

    return {
        "research_plan": plan,
        "thinking_process": [f"📋 Research Plan: {plan.get('reasoning', 'Analyzing question...')}"],
        "iteration": 0,
        "search_history": [],
        "accumulated_knowledge": [],
        "confidence_score": 0.0,
        "knowledge_gaps": plan.get("sub_questions", []),
        "is_complete": False
    }


async def search_node(state: ResearchState) -> ResearchState:
    """
    SEARCHER: Executes intelligent searches based on the current research state.
    Adapts queries based on what has already been found.
    """
    iteration = state["iteration"]
    plan = state["research_plan"] or {}
    accumulated = state["accumulated_knowledge"] or []
    gaps = state["knowledge_gaps"] or []
    search_history = state["search_history"] or []
    thinking = state["thinking_process"] or []

    # Determine what to search for
    if iteration == 0:
        # First iteration: use planned queries
        queries = plan.get("search_queries", [state["original_question"]])[:3]
    else:
        # Subsequent iterations: search for remaining gaps
        queries = gaps[:2] if gaps else []

    if not queries:
        return {"search_history": search_history, "accumulated_knowledge": accumulated}

    # Execute searches
    new_results = []
    for query in queries:
        if query in [h.get("query") for h in search_history]:
            continue  # Skip already searched queries

        results = search_knowledge_base(query, n_results=4)
        search_history.append({"query": query, "results_count": len(results)})

        for r in results:
            # Avoid duplicates
            if not any(k["page"] == r["page"] and k["title"] == r["title"] for k in accumulated):
                new_results.append(r)
                accumulated.append(r)

    thinking.append(f"🔍 Iteration {iteration + 1}: Searched {len(queries)} queries, found {len(new_results)} new relevant passages")

    return {
        "search_history": search_history,
        "accumulated_knowledge": accumulated,
        "thinking_process": thinking,
        "iteration": iteration + 1
    }


async def evaluate_node(state: ResearchState) -> ResearchState:
    """
    EVALUATOR: Assesses if we have enough information to answer comprehensively.
    Identifies knowledge gaps and decides if more research is needed.
    """
    llm = get_llm(temperature=0.1)
    question = state["original_question"]
    plan = state["research_plan"] or {}
    accumulated = state["accumulated_knowledge"] or []
    iteration = state["iteration"]
    thinking = state["thinking_process"] or []

    # Build context from accumulated knowledge
    knowledge_context = "\n\n".join([
        f"[Source: {k['source']}]\n{k['content'][:500]}..."
        for k in accumulated[:10]
    ])

    eval_prompt = f"""You are evaluating research completeness for a dental education question.

ORIGINAL QUESTION: {question}

RESEARCH PLAN:
- Question type: {plan.get('question_type', 'unknown')}
- Expected sections: {plan.get('expected_sections', [])}
- Required depth: {plan.get('depth_required', 'moderate')}

ACCUMULATED KNOWLEDGE ({len(accumulated)} passages found):
{knowledge_context if knowledge_context else "No information found yet."}

CURRENT ITERATION: {iteration} of {MAX_RESEARCH_ITERATIONS}

Evaluate:
1. Do we have enough information to answer the question thoroughly?
2. What specific aspects are still missing or unclear?
3. What is your confidence that we can provide a comprehensive answer?

Respond in JSON:
{{
    "confidence_score": 0.0 to 1.0,
    "is_sufficient": true/false,
    "knowledge_gaps": ["missing aspect 1", "missing aspect 2"],
    "reasoning": "explanation of evaluation"
}}"""

    response = llm.invoke([HumanMessage(content=eval_prompt)])
    evaluation = parse_json_response(response.content)

    confidence = evaluation.get("confidence_score", 0.5)
    is_sufficient = evaluation.get("is_sufficient", False)
    gaps = evaluation.get("knowledge_gaps", [])

    # Determine if research is complete
    is_complete = (
        is_sufficient or
        confidence >= MIN_CONFIDENCE_THRESHOLD or
        iteration >= MAX_RESEARCH_ITERATIONS or
        len(gaps) == 0
    )

    thinking.append(f"📊 Evaluation: Confidence {confidence:.0%}, {'Complete' if is_complete else f'Gaps: {gaps[:2]}'}")

    return {
        "confidence_score": confidence,
        "knowledge_gaps": gaps,
        "is_complete": is_complete,
        "thinking_process": thinking
    }


async def synthesize_node(state: ResearchState) -> ResearchState:
    """
    SYNTHESIZER: Creates the final comprehensive answer from accumulated knowledge.
    Uses intelligent prompting to structure the response appropriately.
    """
    llm = get_llm(temperature=0.7)
    question = state["original_question"]
    plan = state["research_plan"] or {}
    accumulated = state["accumulated_knowledge"] or []
    thinking = state["thinking_process"] or []
    confidence = state["confidence_score"]

    # Build rich context
    sources_context = "\n\n".join([
        f"[{i+1}] {k['source']} (relevance: {k['relevance']:.0%}):\n{k['content']}"
        for i, k in enumerate(accumulated[:12])
    ])

    question_type = plan.get("question_type", "conceptual")
    expected_sections = plan.get("expected_sections", [])

    synthesis_prompt = f"""You are RootED, an expert dental education assistant & dental diagnostic AI assistant..

QUESTION: {question}

QUESTION TYPE: {question_type}
SUGGESTED STRUCTURE: {expected_sections}

RESEARCH FINDINGS:
{sources_context if sources_context else "Limited information available."}

INSTRUCTIONS:
1. Provide a thorough, well-structured answer appropriate for a dental student
2. Use the information from the sources - cite them as [1], [2], etc.
3. Structure your answer logically based on the question type:
   - For COMPARATIVE questions: Create clear comparisons with pros/cons
   - For PROCEDURAL questions: Provide step-by-step explanations
   - For CONCEPTUAL questions: Build from fundamentals to advanced concepts
   - For MULTI_PART questions: Address each aspect systematically

4. If information is incomplete, acknowledge it honestly but provide what you can
5. Use bullet points, headers, and formatting for clarity
6. End with key takeaways or clinical significance



========================
🔎 CLINICAL ASSESSMENT
========================

And structure it EXACTLY in this format:

Most Probable Diagnosis:
- ...

Differential Diagnosis:
- ...
- ...

Severity Level:
- Mild / Moderate / Severe (with short reasoning)

Urgency Level:
- Routine / Soon / Emergency (with reason)

When to See a Dentist:
- Specific timeframe recommendation

Immediate Home Advice:
- Bullet points (safe advice only)

⚠ Disclaimer:
- State clearly this is AI-based preliminary guidance, not a final diagnosis.

IMPORTANT:
- Base conclusions only on provided symptoms and research.
- If uncertainty exists, state it clearly.
- Do NOT hallucinate clinical certainty.
- Maintain professional tone.


Remember: You're helping a dental student learn, so be educational and clear."""



    response = llm.invoke([HumanMessage(content=synthesis_prompt)])
    answer = response.content

    # Add source summary
    if accumulated:
        sources_used = list(set([k["source"] for k in accumulated[:8]]))
        answer += f"\n\n---\n**Sources Referenced:** {', '.join(sources_used)}"

    thinking.append(f"✨ Synthesized answer from {len(accumulated)} sources with {confidence:.0%} confidence")

    return {
        "final_answer": answer,
        "thinking_process": thinking,
        "messages": [AIMessage(content=answer)]
    }


def should_continue_research(state: ResearchState) -> str:
    """Router: Decide if we need more research or can synthesize."""
    if state.get("is_complete", False):
        return "synthesize"
    if state.get("iteration", 0) >= MAX_RESEARCH_ITERATIONS:
        return "synthesize"
    return "search"


def create_research_agent():
    """Create the intelligent research agent graph."""
    workflow = StateGraph(ResearchState)

    # Add nodes
    workflow.add_node("plan", plan_research_node)
    workflow.add_node("search", search_node)
    workflow.add_node("evaluate", evaluate_node)
    workflow.add_node("synthesize", synthesize_node)

    # Define flow
    workflow.add_edge(START, "plan")
    workflow.add_edge("plan", "search")
    workflow.add_edge("search", "evaluate")
    workflow.add_conditional_edges(
        "evaluate",
        should_continue_research,
        {"search": "search", "synthesize": "synthesize"}
    )
    workflow.add_edge("synthesize", END)

    return workflow.compile()


# ============================================
# Simple Chat Agent (for quick responses)
# ============================================

async def simple_chat(message: str, history: List[BaseMessage]) -> str:
    """Quick response for simple questions without deep research."""
    llm = get_llm(temperature=0.7)

    system_prompt = """You are RootED, a friendly dental education assistant.
For simple questions, greetings, or clarifications, respond directly and helpfully.
If the question requires detailed research about dental procedures, techniques, or clinical knowledge,
indicate that you'll do a thorough search of the knowledge base."""

    messages = [SystemMessage(content=system_prompt)]
    messages.extend(history[-6:])  # Last 3 exchanges
    messages.append(HumanMessage(content=message))

    response = llm.invoke(messages)
    return response.content


async def should_deep_research(message: str) -> Dict[str, Any]:
    """Determine if a question needs deep research or simple response."""
    llm = get_llm(temperature=0.1)

    prompt = f"""Analyze this message and determine if it requires deep research from dental textbooks.

MESSAGE: {message}

NEEDS DEEP RESEARCH if it's asking about:
- Specific dental procedures, techniques, or protocols
- Clinical decision-making or treatment planning
- Comparisons between methods or materials
- Detailed explanations of dental concepts
- Evidence-based information from textbooks

SIMPLE RESPONSE if it's:
- A greeting or casual conversation
- A simple clarification about previous response
- General knowledge question
- Request for help or guidance

Respond in JSON:
{{"needs_research": true/false, "reasoning": "brief explanation"}}"""

    response = llm.invoke([HumanMessage(content=prompt)])
    result = parse_json_response(response.content)
    return result if result else {"needs_research": True, "reasoning": "default to research"}


# Create agents
research_agent = None


# ============================================
# Startup
# ============================================

@app.on_event("startup")
async def startup_event():
    global research_agent
    await check_ollama_ready()
    load_document_index()
    research_agent = create_research_agent()
    init_firebase()  # Initialize Firebase for conversation storage
    print("=" * 60)
    print("RootED v3.0 - Intelligent Agentic Research System")
    print(f"Firebase: {'Connected' if db else 'Not configured (memory-only mode)'}")
    print("=" * 60)


# ============================================
# Dental Diagnosis Engine
# ============================================

async def dental_diagnosis_engine(message: str) -> Dict[str, Any]:
    """
    Structured dental diagnosis using local Llama3.
    Returns strict JSON output.
    """
    diagnosis_text = generate_response(
        f"Provide a structured dental diagnosis for these symptoms:\n{message}"
    )
    return {
        "condition": "Preliminary AI assessment",
        "severity": "Needs clinical validation",
        "confidence": "Medium",
        "recommended_action": diagnosis_text,
        "urgent": "Depends on symptoms",
        "explanation": "Generated using local Llama3 with indexed dental context.",
        "disclaimer": "This AI-generated analysis is not a substitute for professional dental consultation.",
    }

# ============================================
# Diagnostic Mode (Default Clinical Mode)
# ============================================

async def diagnostic_mode(message: str) -> Dict[str, Any]:
    """
    Clinical structured diagnostic output for patient symptom inputs.
    This is the default mode.
    """

    return {
        "response": generate_response(message),
        "mode": "diagnose"
    }


# ============================================
# Diagnostic Image
# ============================================

async def diagnose_image_with_llama(image_bytes: bytes) -> str:
    """
    Analyze a dental image using an Ollama vision model (e.g., llava).
    """
    prompt = """
You are a dental AI diagnostic assistant.

Analyze this dental image carefully and provide:

1. Most Probable Diagnosis
2. Observed Findings
3. Severity Level (Mild / Moderate / Severe)
4. Urgency Level (Routine / Soon / Emergency)
5. Recommended Next Steps
6. Disclaimer (AI-generated, not a substitute for professional diagnosis)

Be clinically cautious and explicit about uncertainty.
"""

    encoded_image = base64.b64encode(image_bytes).decode("utf-8")
    payload = {
        "model": OLLAMA_VISION_MODEL,
        "prompt": prompt,
        "images": [encoded_image],
        "stream": False,
    }

    def _call_ollama() -> str:
        response = requests.post(
            f"{OLLAMA_BASE_URL.rstrip('/')}/api/generate",
            json=payload,
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()
        return (data.get("response") or "").strip()

    try:
        analysis = await asyncio.to_thread(_call_ollama)
    except requests.RequestException as exc:
        raise RuntimeError(
            f"Ollama vision request failed for model '{OLLAMA_VISION_MODEL}'. "
            f"Ensure Ollama is running and pull the model with: ollama pull {OLLAMA_VISION_MODEL}. "
            f"Error: {exc}"
        ) from exc

    if not analysis:
        raise RuntimeError(
            f"Ollama vision model '{OLLAMA_VISION_MODEL}' returned an empty response."
        )

    return analysis


# ============================================
# API Endpoints
# ============================================

@app.get("/")
async def root():
    return {
        "name": "RootED API",
        "version": "3.0.0",
        "status": "running",
        "features": [
            "Intelligent Research Planning",
            "Iterative Deep Search",
            "Self-Evaluation",
            "Adaptive Synthesis"
        ]
    }


@app.get("/health")
async def health_check():
    collections = list(document_index.get("collections", {}).keys())
    doc_count = sum(
        len(c.get("documents", []))
        for c in document_index.get("collections", {}).values()
    )
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "3.0.0",
        "llm_provider": "ollama",
        "llm_model": OLLAMA_MODEL,
        "collections": collections,
        "indexed_documents": doc_count
    }


@app.get("/index")
async def get_index():
    return document_index


@app.post("/search")
async def search_endpoint(request: Request):
    data = await request.json()
    query = data.get("query", "").strip()
    n_results = data.get("n_results", 5)

    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    results = search_knowledge_base(query, n_results=n_results)
    return {"query": query, "results": results, "count": len(results)}


@app.post("/chat")
async def chat(request: Request):
    """Chat endpoint backed by local Ollama with dental PDF context."""
    data = await request.json()
    message = data.get("message", "").strip()
    session_id = data.get("session_id", "default")
    user_id = data.get("user_id")  # Firebase user ID
    conversation_id = data.get("conversation_id")  # Firestore conversation ID

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    response = generate_response(message)

    history = dict_to_messages(conversation_memory.get(session_id, []))
    history.append(HumanMessage(content=message))
    history.append(AIMessage(content=response))
    conversation_memory[session_id] = messages_to_dict(history)

    if user_id and conversation_id:
        await save_conversation_to_firebase(user_id, conversation_id, message, response, "diagnose")
        await update_user_progress(user_id, messages_added=2, conversations_added=0)

    return {
        "response": response,
        "session_id": session_id,
        "research_mode": "diagnose",
    }



@app.post("/diagnose")
async def diagnose(request: Request):
    """
    Structured dental diagnosis endpoint.
    """
    data = await request.json()
    message = data.get("message", "").strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    result = await dental_diagnosis_engine(message)

    return {
        "diagnosis": result,
        "mode": "clinical_diagnosis"
    }



@app.post("/diagnose/image")
async def diagnose_image(file: UploadFile = File(...)):
    """
    Analyze dental image (X-ray / oral photo) and return structured diagnosis.
    """

    try:
        image_bytes = await file.read()
        analysis = await diagnose_image_with_llama(image_bytes)

        return {
            "analysis": analysis,
            "mode": "image_diagnosis"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/stream")
async def chat_stream(request: Request):
    """Streaming chat backed by local Ollama and dental context."""
    data = await request.json()
    message = data.get("message", "").strip()
    session_id = data.get("session_id", "default")
    user_id = data.get("user_id")  # Firebase user ID
    conversation_id = data.get("conversation_id")  # Firestore conversation ID

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    async def generate():
        history = dict_to_messages(conversation_memory.get(session_id, []))
        yield f"data: {json.dumps({'type': 'status', 'content': 'Retrieving dental context...'})}\n\n"

        context_snippets = search_knowledge_base(message, n_results=6)
        sources = list({item.get("source", "") for item in context_snippets if item.get("source")})
        if sources:
            yield f"data: {json.dumps({'type': 'sources', 'content': sources})}\n\n"

        answer = generate_response(message)
        for chunk in [answer[i:i+40] for i in range(0, len(answer), 40)]:
            yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            await asyncio.sleep(0.02)

        history.append(HumanMessage(content=message))
        history.append(AIMessage(content=answer))
        conversation_memory[session_id] = messages_to_dict(history)

        if user_id and conversation_id:
            await save_conversation_to_firebase(user_id, conversation_id, message, answer, "diagnose", sources)
            await update_user_progress(user_id, messages_added=2)

        yield f"data: {json.dumps({'type': 'done', 'research_mode': 'diagnose', 'conversation_id': conversation_id})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    if session_id not in conversation_memory:
        return {"messages": [], "session_id": session_id}
    return {
        "messages": conversation_memory[session_id],
        "session_id": session_id,
        "message_count": len(conversation_memory[session_id])
    }


@app.delete("/chat/history/{session_id}")
async def clear_chat_history(session_id: str):
    if session_id in conversation_memory:
        del conversation_memory[session_id]
    return {"status": "cleared", "session_id": session_id}


# ============================================
# Main
# ============================================

if __name__ == "__main__":
    print("=" * 60)
    print("RootED v3.0 - Intelligent Agentic Research System")
    print("=" * 60)
    print("LLM Provider: Ollama")
    print(f"Model: {OLLAMA_MODEL}")
    print("=" * 60)

    load_document_index()
    research_agent = create_research_agent()

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
