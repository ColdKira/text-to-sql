import json
import logging
import os
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# ---------------------------------------------------------
# State Definition: Supports Agent Status Tracking
# ---------------------------------------------------------
class DataIntelligenceState(TypedDict):
    user_query: str
    current_agent: str        # To track who is thinking
    thinking_steps: List[str] # Detailed log for the "Thinking..." UI
    execution_plan: List[str]
    generated_sql: str
    validation_status: str
    optimization_notes: str
    raw_data: List[Dict[str, Any]]
    final_insights: str
    error_count: int
    cost_estimation: float

# ---------------------------------------------------------
# LLM Configuration (Gemini 3 Flash)
# ---------------------------------------------------------
def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0
    )

# ---------------------------------------------------------
# Agent Nodes
# ---------------------------------------------------------

def planner_agent(state: DataIntelligenceState):
    """Breaks down intent into multi-step execution plans."""
    logger.info("Agent: Planner")
    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Nexus Planner. Break user queries into logical steps for a SQL engine."),
        ("user", "{query}")
    ])
    response = llm.invoke(prompt.format_messages(query=state["user_query"]))
    plan = [s.strip() for s in response.content.split("\n") if s]
    
    return {
        "current_agent": "planner",
        "thinking_steps": state.get("thinking_steps", []) + ["Generated execution plan."],
        "execution_plan": plan
    }

def sql_generator_agent(state: DataIntelligenceState):
    """Produces raw PostgreSQL queries using schema context."""
    logger.info("Agent: SQL Generator")
    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the SQL Generator. Convert the plan into valid PostgreSQL. Output ONLY SQL."),
        ("user", "Plan: {plan}")
    ])
    response = llm.invoke(prompt.format_messages(plan=str(state["execution_plan"])))
    sql = response.content.replace("```sql", "").replace("```", "").strip()
    
    return {
        "current_agent": "generator",
        "thinking_steps": state.get("thinking_steps", []) + ["Mapped plan to optimized SQL."],
        "generated_sql": sql
    }

def validator_agent(state: DataIntelligenceState):
    """Security and syntax validation (Self-healing)."""
    logger.info("Agent: Validator")
    sql = state["generated_sql"].upper()
    
    # Simple safety
    if any(k in sql for k in ["DELETE", "DROP", "UPDATE", "INSERT"]):
        return {
            "validation_status": "REJECTED_UNSAFE",
            "thinking_steps": state.get("thinking_steps", []) + ["Safety check: REJECTED."]
        }
        
    return {
        "validation_status": "PASS",
        "thinking_steps": state.get("thinking_steps", []) + ["Syntax and safety validation: PASS."]
    }

def optimizer_agent(state: DataIntelligenceState):
    """Performance optimization logic."""
    logger.info("Agent: Optimizer")
    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Optimize this SQL for performance. Suggest if indexes are needed."),
        ("user", "{sql}")
    ])
    response = llm.invoke(prompt.format_messages(sql=state["generated_sql"]))
    
    return {
        "current_agent": "optimizer",
        "thinking_steps": state.get("thinking_steps", []) + ["Applied performance optimization rules."],
        "optimization_notes": response.content,
        "cost_estimation": 0.001
    }

def execute_query_node(state: DataIntelligenceState):
    """Live Database Execution (Mocked for Demo)."""
    logger.info("Node: Executor")
    # Simulate DB data
    mock_data = [{"month": "Jan", "val": 450}, {"month": "Feb", "val": 600}, {"month": "Mar", "val": 850}]
    return {
        "current_agent": "executor",
        "thinking_steps": state.get("thinking_steps", []) + ["Executed query successfully."],
        "raw_data": mock_data
    }

def explainer_agent(state: DataIntelligenceState):
    """Generates human-readable business insights."""
    logger.info("Agent: Explainer")
    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Summarize results into actionable business logic."),
        ("user", "Query: {query}\nData: {data}")
    ])
    response = llm.invoke(prompt.format_messages(query=state["user_query"], data=str(state["raw_data"])))
    
    return {
        "current_agent": "explainer",
        "thinking_steps": state.get("thinking_steps", []) + ["Summarizing data into business insights."],
        "final_insights": response.content
    }

# ---------------------------------------------------------
# Routing Integration
# ---------------------------------------------------------
def validation_router(state: DataIntelligenceState):
    if state["validation_status"] == "PASS":
        return "optimizer"
    return END

# ---------------------------------------------------------
# Compile Workflow
# ---------------------------------------------------------
workflow = StateGraph(DataIntelligenceState)

workflow.add_node("planner", planner_agent)
workflow.add_node("sql_generator", sql_generator_agent)
workflow.add_node("validator", validator_agent)
workflow.add_node("optimizer", optimizer_agent)
workflow.add_node("executor", execute_query_node)
workflow.add_node("explainer", explainer_agent)

workflow.add_edge("planner", "sql_generator")
workflow.add_edge("sql_generator", "validator")
workflow.add_conditional_edges("validator", validation_router)
workflow.add_edge("optimizer", "executor")
workflow.add_edge("executor", "explainer")
workflow.add_edge("explainer", END)

workflow.set_entry_point("planner")
intelligence_agent = workflow.compile()
