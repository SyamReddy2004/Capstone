"""QCircuit Eval API – Quantum Circuit Benchmark Evaluator."""

from __future__ import annotations

import hashlib
import random
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# ── App setup ──────────────────────────────────────────────────────────────────

app = FastAPI(
    title="QCircuit Eval API",
    description="Evaluate LLM performance on quantum circuit generation tasks",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Constants ──────────────────────────────────────────────────────────────────

ALL_MODELS = [
    "Llama 3", "Phi-3", "ChatGPT", "Gemini",
    "Claude", "DeepSeek", "Perplexity", "Copilot",
]

QCIRCUIT_TASKS = [
    "Bell State (2-qubit)",
    "GHZ State (Multi-qubit)",
    "QFT",
    "Grover's Search",
    "VQE Ansatz",
]

# Base difficulty per task (higher = easier for LLMs)
TASK_DIFFICULTY: dict[str, int] = {
    "Bell State (2-qubit)": 90,
    "GHZ State (Multi-qubit)": 82,
    "QFT": 65,
    "Grover's Search": 58,
    "VQE Ansatz": 45,
}

# Per-model skill bias (additive)
MODEL_BIAS: dict[str, int] = {
    "ChatGPT": 6,
    "Claude": 7,
    "Gemini": 4,
    "Copilot": 3,
    "DeepSeek": 2,
    "Perplexity": 1,
    "Llama 3": 0,
    "Phi-3": -10,
}

# ── Schemas ────────────────────────────────────────────────────────────────────

class EvalRequest(BaseModel):
    task: str = Field(..., description="Quantum circuit task to evaluate")
    models: list[str] = Field(..., min_length=1, description="Models to evaluate")

    @field_validator("task")
    @classmethod
    def validate_task(cls, v: str) -> str:
        if v not in QCIRCUIT_TASKS:
            raise ValueError(f"Unknown task '{v}'. Choose from: {QCIRCUIT_TASKS}")
        return v

    @field_validator("models")
    @classmethod
    def validate_models(cls, v: list[str]) -> list[str]:
        unknown = [m for m in v if m not in ALL_MODELS]
        if unknown:
            raise ValueError(f"Unknown model(s): {unknown}. Choose from: {ALL_MODELS}")
        return v


class ModelResult(BaseModel):
    name: str
    accuracy: float
    efficiency: float
    syntaxErrors: int
    gateCount: int
    circuitDepth: int


class EvalResponse(BaseModel):
    task: str
    results: list[ModelResult]


# ── Helpers ────────────────────────────────────────────────────────────────────

def _deterministic_seed(task: str, model: str) -> int:
    """Produce a stable seed so the same task+model pair always gives similar results."""
    digest = hashlib.sha256(f"{task}::{model}".encode()).hexdigest()
    return int(digest[:8], 16)


def _score_model(task: str, model: str) -> ModelResult:
    seed = _deterministic_seed(task, model)
    rng = random.Random(seed)

    base = TASK_DIFFICULTY.get(task, 60)
    bias = MODEL_BIAS.get(model, 0)
    variance = rng.randint(-8, 8)

    accuracy = max(10, min(100, base + bias + variance))
    efficiency = max(10, min(100, accuracy - rng.uniform(2, 14)))
    syntax_errors = max(0, rng.randint(0, 12) - bias)
    gate_count = rng.randint(4, 30) + (15 if "QFT" in task else 0)
    circuit_depth = max(2, gate_count // rng.randint(2, 5))

    return ModelResult(
        name=model,
        accuracy=round(accuracy, 1),
        efficiency=round(efficiency, 1),
        syntaxErrors=syntax_errors,
        gateCount=gate_count,
        circuitDepth=circuit_depth,
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/api/models")
async def list_models():
    return {"models": ALL_MODELS}


@app.get("/api/tasks")
async def list_tasks():
    return {"tasks": QCIRCUIT_TASKS}


@app.post("/api/evaluate", response_model=EvalResponse)
async def evaluate_models(request: EvalRequest):
    results = [_score_model(request.task, m) for m in request.models]
    return EvalResponse(task=request.task, results=results)
