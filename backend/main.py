from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from google import genai
import os
import re
import traceback
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    query: Optional[str] = None
    template_id: Optional[str] = None
    current_code: Optional[str] = None

candidate_models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-3.5-flash"
]

@app.post("/api/generate")
async def generate_app(req: GenerateRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        return JSONResponse(
            status_code=400,
            content={"detail": "GEMINI_API_KEY is not set in backend/.env"}
        )

    user_prompt = req.prompt or req.query or ""
    if not user_prompt.strip() and not req.template_id:
        return JSONResponse(
            status_code=400,
            content={"detail": "Prompt is required."}
        )

    try:
        client = genai.Client(api_key=api_key)
        
        system_prompt = (
            "You are an expert React TypeScript engineer. Return ONLY raw, valid TSX code for a single standalone component. "
            "Always include: import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'; at the very top. "
            "Always export default function App() { ... }. "
            "Use Tailwind CSS utility classes. DO NOT wrap with markdown json tags or write explanation text."
        )
        
        user_content = user_prompt
        if req.current_code and req.current_code.strip():
            user_content += f"\n\nExisting React Code to Modify:\n{req.current_code}"

        full_prompt = f"{system_prompt}\n\nUser Prompt: {user_content}"
        
        response = None
        last_error = None

        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=full_prompt
                )
                if response and response.text:
                    print(f"Successfully generated using model: {model_name}")
                    break
            except Exception as model_err:
                last_error = model_err
                print(f"Model {model_name} failed: {model_err}, trying candidate fallback...")

        if not response or not response.text:
            raise last_error or Exception("All candidate models failed to generate content.")

        code = response.text or ""
        
        # Clean backticks
        code = re.sub(r"^```(?:tsx|jsx|typescript|javascript|json)?\s*", "", code.strip(), flags=re.MULTILINE)
        code = re.sub(r"```\s*$", "", code.strip(), flags=re.MULTILINE).strip()
        
        if "import React" not in code:
            code = "import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';\n" + code

        return {"code": code, "type": "app", "message": "✨ Generated micro-app component on the canvas."}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok"}
