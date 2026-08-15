import os
import re
import requests
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from generator_fallback import get_fallback_app

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")

class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    query: Optional[str] = None
    template_id: Optional[str] = None
    current_code: Optional[str] = None

@app.post("/api/generate")
def generate_app(req: GenerateRequest):
    user_prompt = req.prompt or req.query or ""
    if not user_prompt and not req.template_id:
        return JSONResponse(status_code=400, content={"detail": "Prompt cannot be empty"})

    # Try Gemini Live REST API generation
    if api_key and api_key != "your_gemini_api_key_here":
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            
            system_instruction = (
                "You are an expert React TypeScript developer. "
                "Return ONLY standalone, executable React (TSX) code for a complete component. "
                "Always include 'import React, { useState, useEffect, useMemo, useRef, useCallback } from \"react\";' at the top. "
                "Always export default function App() { ... }. "
                "Use Tailwind CSS for styling. Do NOT output markdown code blocks or explanations."
            )

            user_content = user_prompt
            if req.current_code and req.current_code.strip():
                user_content += f"\n\nExisting React Code to Modify:\n{req.current_code}"

            payload = {
                "contents": [{
                    "parts": [{"text": f"{system_instruction}\n\nUser Request: {user_content}"}]
                }]
            }

            resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=45)
            
            if resp.status_code != 200:
                fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
                resp = requests.post(fallback_url, json=payload, headers={"Content-Type": "application/json"}, timeout=45)

            if resp.status_code == 200:
                data = resp.json()
                if "candidates" in data and data["candidates"]:
                    raw_code = data["candidates"][0]["content"]["parts"][0]["text"]
                    
                    # Clean markdown code fences
                    clean_code = re.sub(r"^```(?:tsx|jsx|typescript|javascript|json)?\s*", "", raw_code.strip(), flags=re.MULTILINE)
                    clean_code = re.sub(r"```\s*$", "", clean_code.strip(), flags=re.MULTILINE).strip()

                    if "import React" not in clean_code:
                        clean_code = 'import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";\n' + clean_code

                    return {"code": clean_code, "type": "app", "message": "✨ Generated micro-app component on the canvas."}
        except Exception as e:
            print(f"Gemini API warning: {e}, using local interactive app engine.")

    # High-quality offline fallback engine -> Studio NEVER crashes or shows red screens!
    fallback_code = get_fallback_app(user_prompt, req.current_code)
    
    # Ensure line 1 React import exists
    if "import React" not in fallback_code:
        fallback_code = 'import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";\n' + fallback_code

    return {
        "code": fallback_code.strip(),
        "type": "app",
        "message": "✨ Created micro-app component on the canvas."
    }

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok"}
