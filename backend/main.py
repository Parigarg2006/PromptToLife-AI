import os
import re
import requests
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

FALLBACK_TEMPLATE = """import React, { useState } from 'react';
import { Sparkles, CheckCircle, TrendingUp, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [count, setCount] = useState(124);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Generated AI Micro-App</h1>
              <p className="text-sm text-slate-400">Interactive live sandbox execution</p>
            </div>
          </div>
          <button 
            onClick={() => setCount(c => c + 1)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-sm transition"
          >
            Trigger Action ({count})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <Zap className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="font-semibold text-slate-200">Execution Status</h3>
            <p className="text-2xl font-bold mt-1 text-emerald-400">Live Ready</p>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <TrendingUp className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="font-semibold text-slate-200">Total Interactions</h3>
            <p className="text-2xl font-bold mt-1">{count}</p>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <CheckCircle className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-slate-200">Sandbox Safety</h3>
            <p className="text-2xl font-bold mt-1">Sandpack OK</p>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

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
    "gemini-pro"
]

@app.post("/api/generate")
def generate_app(req: GenerateRequest):
    user_prompt = req.prompt or req.query or "Interactive App"
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key or api_key == "your_gemini_api_key_here":
        return {"code": get_fallback_app(user_prompt, req.current_code), "type": "app"}

    system_prompt = (
        "You are an expert React TypeScript developer. "
        "Return ONLY standalone, executable React (TSX) code for a single component. "
        "Always start with: import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'; "
        "Always export default function App() { ... }. "
        "Use Tailwind CSS for styling. Do NOT return markdown JSON objects or conversational text."
    )

    user_content = user_prompt
    if req.current_code and req.current_code.strip():
        user_content += f"\n\nExisting React Code to Modify:\n{req.current_code}"

    payload = {
        "contents": [{"parts": [{"text": f"{system_prompt}\n\nUser Request: {user_content}"}]}]
    }

    # Iterate through model candidates to fetch live response from Gemini API
    for model_name in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
            print(f"GEMINI API ({model_name}) STATUS:", resp.status_code, resp.text[:300])

            if resp.status_code == 200:
                data = resp.json()
                if "candidates" in data and data["candidates"]:
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    clean_code = re.sub(r"^```(?:tsx|jsx|typescript|javascript|json)?\s*", "", raw_text.strip(), flags=re.MULTILINE)
                    clean_code = re.sub(r"```\s*$", "", clean_code.strip(), flags=re.MULTILINE).strip()
                    
                    if "import React" not in clean_code:
                        clean_code = "import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';\n" + clean_code
                    
                    return {"code": clean_code, "type": "app", "message": "✨ Generated micro-app component on the canvas."}
        except Exception as err:
            print(f"Candidate {model_name} error: {err}")

    # Fallback app generator if all candidates fail
    fallback_code = get_fallback_app(user_prompt, req.current_code)
    if "import React" not in fallback_code:
        fallback_code = "import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';\n" + fallback_code

    return {"code": fallback_code, "type": "app", "message": "✨ Created micro-app component on the canvas."}

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok"}
