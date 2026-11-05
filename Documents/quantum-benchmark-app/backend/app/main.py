from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import random
import os

app = FastAPI(title="QCircuit Eval API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvalRequest(BaseModel):
    task: str
    models: list[str]

@app.post("/api/evaluate")
async def evaluate_models(request: EvalRequest):
    if not request.models:
        raise HTTPException(status_code=400, detail="No models provided")

    task = request.task
    base_difficulty = 90 if "Bell" in task else 85 if "GHZ" in task else 65 if "QFT" in task else 60 if "Grover" in task else 45
    
    results = []
    for model in request.models:
        variance = random.randint(-10, 10)
        accuracy = base_difficulty + variance
        
        if model in ["Claude", "ChatGPT"]: accuracy += 5
        if model == "Phi-3": accuracy -= 12
        
        accuracy = min(100, max(10, accuracy))
        efficiency = min(100, max(10, accuracy - random.uniform(0, 15)))
        syntax_errors = random.randint(0, 15)
        
        results.append({
            "name": model,
            "accuracy": round(accuracy, 1),
            "efficiency": round(efficiency, 1),
            "syntaxErrors": syntax_errors
        })
        
    return {"task": task, "results": results}

# Serve frontend static files if built
frontend_dist = os.path.join(os.path.dirname(__file__), "../../frontend/dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")