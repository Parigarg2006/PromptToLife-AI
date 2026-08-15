from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from google import genai
import os
import re
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
    prompt: str
    template_id: Optional[str] = None
    current_code: Optional[str] = None

@app.post("/api/generate")
async def generate_app(req: GenerateRequest):
    try:
        if not api_key:
            return JSONResponse(status_code=500, content={"error": "API key missing"})

        client = genai.Client(api_key=api_key)
        
        system_prompt = (
            "You are an expert React TypeScript engineer. Return ONLY raw, valid TSX code for a single standalone component. "
            "Always include: import React, { useState, useEffect, useMemo, useRef } from 'react'; at the very top. "
            "Always export default function App() { ... }. "
            "Use Tailwind CSS utility classes. DO NOT wrap with markdown json tags or write explanation text."
        )
        
        user_content = req.prompt
        if req.current_code and req.current_code.strip():
            user_content += f"\n\nExisting React Code to Modify:\n{req.current_code}"

        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=f"{system_prompt}\n\nUser Prompt: {user_content}"
        )
        
        code = response.text or ""
        
        # Clean backticks
        code = re.sub(r"^```(?:tsx|jsx|typescript|javascript|json)?\s*", "", code.strip(), flags=re.MULTILINE)
        code = re.sub(r"```\s*$", "", code.strip(), flags=re.MULTILINE).strip()
        
        if "import React" not in code:
            code = "import React, { useState, useEffect, useMemo, useRef } from 'react';\n" + code

        return {"code": code, "type": "app"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok"}
