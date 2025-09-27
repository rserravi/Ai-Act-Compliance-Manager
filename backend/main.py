from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="AI Act Compliance Manager API", version="0.1.0")

class AISystem(BaseModel):
    id: str
    name: str
    role: str  # provider/importer/distributor/user
    risk: Optional[str] = None

DB: List[AISystem] = []

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/systems", response_model=AISystem)
def create_system(sys: AISystem):
    DB.append(sys)
    return sys

@app.get("/systems", response_model=List[AISystem])
def list_systems():
    return DB
