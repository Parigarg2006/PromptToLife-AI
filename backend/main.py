import os
import asyncio
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from generator import route_and_generate, PRESET_TEMPLATES

# Load environment variables from .env
load_dotenv()

# Initialize SlowAPI Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(
    title="PromptToLife AI API",
    description="Production-ready backend with SlowAPI rate limiting & concurrency queueing.",
    version="1.3.0"
)

# Attach limiter to FastAPI state and exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS setup
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Concurrency Semaphore: max 10 heavy AI generation tasks running simultaneously
GENERATION_SEMAPHORE = asyncio.Semaphore(10)

class GenerateRequest(BaseModel):
    prompt: str
    template_id: Optional[str] = None
    current_code: Optional[str] = None

class GenerateResponse(BaseModel):
    type: str  # "app" or "text"
    code: Optional[str] = None
    content: Optional[str] = None
    message: Optional[str] = None
    prompt: str

@app.get("/")
def read_root():
    return {
        "service": "PromptToLife AI API",
        "version": "1.3.0",
        "status": "production_ready",
        "rate_limit": "10/minute per IP on /api/generate",
        "max_concurrency": 10
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "PromptToLife AI Backend",
        "version": "1.3.0",
        "concurrency_limit": 10
    }

@app.get("/api/templates")
def get_templates():
    templates = []
    for tid, data in PRESET_TEMPLATES.items():
        templates.append({
            "id": data["id"],
            "title": data["title"],
            "category": data["category"],
            "prompt": data["prompt"]
        })
    return {"templates": templates}

@app.post("/api/generate", response_model=GenerateResponse)
@limiter.limit("10/minute")
async def generate_endpoint(request: Request, req: GenerateRequest):
    """Production endpoint with SlowAPI rate limiting (10 req/min) & Semaphore queueing (max 10 concurrent)."""
    if not req.prompt and not req.template_id:
        raise HTTPException(status_code=400, detail="Prompt or template_id is required.")

    try:
        # Queue request through Semaphore with a generous 45-second timeout
        async with GENERATION_SEMAPHORE:
            result = await asyncio.wait_for(
                asyncio.to_thread(
                    route_and_generate,
                    prompt=req.prompt,
                    current_code=req.current_code,
                    template_id=req.template_id
                ),
                timeout=45.0
            )

        return GenerateResponse(
            type=result.get("type", "app"),
            code=result.get("code"),
            content=result.get("content"),
            message=result.get("message"),
            prompt=req.prompt
        )

    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Generation request timed out. Please try again with a shorter prompt."
        )
    except RateLimitExceeded:
        raise HTTPException(
            status_code=429,
            detail="Too many generation requests. Rate limit is 10 requests per minute per IP."
        )
    except Exception as e:
        err_msg = str(e)
        if "429" in err_msg or "quota" in err_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="LLM Provider Rate Limit reached. Please wait a moment before trying again."
            )
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed cleanly: {err_msg}"
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
