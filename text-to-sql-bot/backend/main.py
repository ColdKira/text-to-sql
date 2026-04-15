import os
import json
import logging
import redis
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import the LangGraph workflow
from app.agents.graph import intelligence_agent, DataIntelligenceState

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title="Nexus Copilot Autonomous Data Engine",
    description="Multi-Agent LangGraph system using Google Gemini 1.5 Flash.",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis Caching (Optional)
try:
    cache = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    cache.ping()
    REDIS_AVAILABLE = True
except Exception:
    logger.warning("Redis connection failed. Caching disabled.")
    REDIS_AVAILABLE = False

# ---------------------------------------------------------
# Schemas
# ---------------------------------------------------------
class QueryRequest(BaseModel):
    question: str = Field(..., description="The multi-step natural language question.")

class AgentResponse(BaseModel):
    success: bool
    answer: str
    query_executed: str
    structured_data: list
    cost_estimation: float
    optimization_notes: str
    thinking_steps: list  # Added tracking for the "Thinking..." UI

# ---------------------------------------------------------
# Core Endpoints
# ---------------------------------------------------------
@app.post("/api/query", response_model=AgentResponse)
async def process_complex_query(request: QueryRequest):
    question = request.question
    
    # 1. Cache hit?
    if REDIS_AVAILABLE:
        cached_result = cache.get(f"nexus_cache:{question}")
        if cached_result:
            return AgentResponse(**json.loads(cached_result))

    # 2. Invoke the autonomous agent state machine
    try:
        initial_state = {
            "user_query": question,
            "thinking_steps": [],
            "error_count": 0
        }
        
        # Invoke the multi-agent graph
        final_state = intelligence_agent.invoke(initial_state)

        response_payload = {
            "success": True,
            "answer": final_state.get("final_insights", "Processed successfully."),
            "query_executed": final_state.get("generated_sql", "No SQL generated"),
            "structured_data": final_state.get("raw_data", []),
            "cost_estimation": final_state.get("cost_estimation", 0.0),
            "optimization_notes": final_state.get("optimization_notes", "No notes."),
            "thinking_steps": final_state.get("thinking_steps", [])
        }
        
        # 3. Store to Cache
        if REDIS_AVAILABLE:
            cache.setex(f"nexus_cache:{question}", 3600, json.dumps(response_payload))
            
        return AgentResponse(**response_payload)
        
    except Exception as e:
        logger.error(f"Engine failure: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Autonomous Agent Pipeline Failed.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
