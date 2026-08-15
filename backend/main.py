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
    try:
        user_prompt = req.prompt or req.query or ""
        if not user_prompt and not req.template_id:
            return JSONResponse(status_code=400, content={"detail": "Prompt cannot be empty"})

        if not api_key or api_key == "your_gemini_api_key_here":
            return JSONResponse(status_code=500, content={"detail": "GEMINI_API_KEY missing in backend/.env"})

        # Direct REST API endpoint
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

        resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=60)
        
        if resp.status_code != 200:
            # Fallback to gemini-pro if flash gives an issue
            fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
            resp = requests.post(fallback_url, json=payload, headers={"Content-Type": "application/json"}, timeout=60)

        data = resp.json()
        
        if "candidates" not in data or not data["candidates"]:
            error_msg = data.get("error", {}).get("message", "No response from Gemini API")
            return JSONResponse(status_code=500, content={"detail": error_msg})

        code = data["candidates"][0]["content"]["parts"][0]["text"]
        
        # Clean markdown code fences
        code = re.sub(r"^```(?:tsx|jsx|typescript|javascript|json)?\s*", "", code.strip(), flags=re.MULTILINE)
        code = re.sub(r"```\s*$", "", code.strip(), flags=re.MULTILINE).strip()

        if "import React" not in code:
            code = 'import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";\n' + code

        return {"code": code, "type": "app", "message": "✨ Generated micro-app component on the canvas."}

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok"}
