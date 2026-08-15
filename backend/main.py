import os
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
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
if api_key:
    genai.configure(api_key=api_key)

class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    query: Optional[str] = None
    template_id: Optional[str] = None
    current_code: Optional[str] = None

def get_working_model():
    """Dynamically finds the first active model that supports generateContent."""
    try:
        models = [
            m.name for m in genai.list_models()
            if "generateContent" in m.supported_generation_methods
        ]
        # Prioritize flash models, then pro models, else take the first available
        for m in models:
            if "flash" in m.lower():
                print(f"Dynamically selected model: {m}")
                return genai.GenerativeModel(m)
        for m in models:
            if "pro" in m.lower():
                print(f"Dynamically selected model: {m}")
                return genai.GenerativeModel(m)
        if models:
            print(f"Dynamically selected model: {models[0]}")
            return genai.GenerativeModel(models[0])
    except Exception as e:
        print(f"Error fetching model list: {e}")
    
    # Fallback default
    return genai.GenerativeModel("gemini-1.5-flash")

@app.post("/api/generate")
async def generate_app(req: GenerateRequest):
    try:
        user_prompt = req.prompt or req.query or ""
        if not user_prompt and not req.template_id:
            return JSONResponse(status_code=400, content={"detail": "Prompt cannot be empty"})

        if not api_key:
            return JSONResponse(status_code=500, content={"detail": "GEMINI_API_KEY missing in .env"})

        model = get_working_model()
        
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

        response = await model.generate_content_async(
            f"{system_instruction}\n\nUser Request: {user_content}"
        )
        
        code = response.text or ""
        code = re.sub(r"^```(?:tsx|jsx|typescript|javascript|json)?\s*", "", code.strip(), flags=re.MULTILINE)
        code = re.sub(r"```\s*$", "", code.strip(), flags=re.MULTILINE).strip()

        if "import React" not in code:
            code = 'import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";\n' + code

        return {"code": code, "type": "app", "message": "✨ Generated micro-app component on the canvas."}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok"}
