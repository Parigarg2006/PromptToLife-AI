import os
import re
import json
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from generator_fallback import get_fallback_app

SYSTEM_ROUTER_PROMPT = """You are an expert React/Tailwind engineer & product designer.
Return ONLY raw, standalone, executable React (TSX/JSX) code inside a single component.
- ALWAYS begin with: import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
- ALWAYS export default function App() { ... }
- Use Tailwind CSS utility classes for styling.
- DO NOT wrap the output in JSON format (do NOT output {"type": "app", ...}).
- Output ONLY the TypeScript/React code."""

PRESET_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "trip-splitter": {
        "id": "trip-splitter",
        "title": "💰 LedgerFlow - Trip Budget Calculator",
        "category": "Finance",
        "prompt": "Create a Splitwise & Trip Budget Calculator micro-app to split bills among friends with settlement calculation, category tags, and balance overview.",
        "code": """import React, { useState, useMemo } from 'react';
import { Wallet, Plus, Trash2, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';

export default function App() {
  const [friends, setFriends] = useState(['Alex', 'Sam', 'Jordan', 'Taylor']);
  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Mountain Cabin Resort Stay', amount: 540.00, paidBy: 'Alex', date: '2026-08-14', category: 'Lodging' },
    { id: 2, description: 'Roadtrip Gas & Tolls', amount: 85.50, paidBy: 'Sam', date: '2026-08-12', category: 'Travel' },
    { id: 3, description: 'Group Seafood Dinner', amount: 195.00, paidBy: 'Jordan', date: '2026-08-10', category: 'Food' },
  ]);

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('Alex');

  const addExpense = (e) => {
    e.preventDefault();
    if (!desc || !amount || parseFloat(amount) <= 0) return;
    const newEx = { id: Date.now(), description: desc, amount: parseFloat(amount), paidBy, date: new Date().toISOString().split('T')[0], category: 'General' };
    setExpenses([newEx, ...expenses]);
    setDesc(''); setAmount('');
  };

  const removeExpense = (id) => setExpenses(expenses.filter(e => e.id !== id));

  const stats = useMemo(() => {
    const total = expenses.reduce((acc, e) => acc + e.amount, 0);
    const perPerson = friends.length > 0 ? total / friends.length : 0;
    const balances = {};
    friends.forEach(f => balances[f] = -perPerson);
    expenses.forEach(e => { if (balances[e.paidBy] !== undefined) balances[e.paidBy] += e.amount; });
    return { total, perPerson, balances };
  }, [expenses, friends]);

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '12px', borderRadius: '14px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)', display: 'flex' }}>
              <Wallet style={{ width: '24px', height: '24px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>LedgerFlow</h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Equalize group expenses & settle balances</p>
            </div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
            {friends.length} Group Members
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(23, 32, 51, 0.7)', border: '1px solid #2a3754', padding: '20px', borderRadius: '18px', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Trip Spent</span>
            <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: '#34d399' }}>${stats.total.toFixed(2)}</div>
          </div>
          <div style={{ background: 'rgba(23, 32, 51, 0.7)', border: '1px solid #2a3754', padding: '20px', borderRadius: '18px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cost Per Person</span>
            <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: '#60a5fa' }}>${stats.perPerson.toFixed(2)}</div>
          </div>
        </div>

        <div style={{ background: '#172033', border: '1px solid #2a3754', borderRadius: '18px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#cbd5e1' }}>Settlement Balances</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {friends.map(f => {
              const bal = stats.balances[f] || 0;
              const getsBack = bal >= 0;
              return (
                <div key={f} style={{ background: '#0b0f19', border: '1px solid #2a3754', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{f}</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: getsBack ? '#34d399' : '#f87171' }}>
                    {getsBack ? `+$${bal.toFixed(2)}` : `-$${Math.abs(bal).toFixed(2)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={addExpense} style={{ background: '#172033', border: '1px solid #2a3754', borderRadius: '18px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '15px' }}>Record New Trip Expense</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <input type="text" placeholder="Expense description..." value={desc} onChange={(e) => setDesc(e.target.value)} style={{ background: '#0b0f19', border: '1px solid #2a3754', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }} />
            <input type="number" step="0.01" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ background: '#0b0f19', border: '1px solid #2a3754', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }} />
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} style={{ background: '#0b0f19', border: '1px solid #2a3754', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}>
              {friends.map(f => <option key={f} value={f}>Paid by {f}</option>)}
            </select>
          </div>
          <button type="submit" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
            <Plus style={{ width: '18px' }} /> Record Expense
          </button>
        </form>

        <div style={{ background: '#172033', border: '1px solid #2a3754', borderRadius: '18px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '15px' }}>Trip Expenses History ({expenses.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expenses.map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0b0f19', border: '1px solid #2a3754', padding: '12px 16px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{e.description}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Paid by <span style={{ color: '#60a5fa' }}>{e.paidBy}</span> • {e.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '700', fontSize: '15px', color: '#34d399' }}>${e.amount.toFixed(2)}</span>
                  <button onClick={() => removeExpense(e.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 style={{ width: '16px' }} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
"""
    }
}

def clean_generated_code(raw_text: str) -> str:
    """Strips markdown fences, extracts code from JSON strings if present, and ensures React imports."""
    if not raw_text:
        return ""
    
    clean_code = raw_text.strip()
    
    # Strip markdown code fences
    clean_code = re.sub(r"^```(?:tsx|jsx|typescript|javascript|json)?\n?", "", clean_code, flags=re.MULTILINE)
    clean_code = re.sub(r"```$", "", clean_code, flags=re.MULTILINE).strip()

    # If raw code payload is wrapped inside a JSON string {"type":"app","code":"..."}
    if clean_code.startswith("{") and clean_code.endswith("}"):
        try:
            parsed = json.loads(clean_code)
            if isinstance(parsed, dict) and "code" in parsed and isinstance(parsed["code"], str):
                return clean_generated_code(parsed["code"])
        except Exception:
            pass

    full_react_import = "import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';"
    if "import React" not in clean_code:
        clean_code = f"{full_react_import}\n{clean_code}"
    elif re.search(r"import\s+React\s+from\s+['\"]react['\"];?", clean_code):
        clean_code = re.sub(r"import\s+React\s+from\s+['\"]react['\"];?", full_react_import, clean_code)

    # Ensure export default function App() signature exists
    if "export default function App" not in clean_code:
        if "function App" in clean_code:
            clean_code = clean_code.replace("function App", "export default function App")
        elif "const App =" in clean_code:
            clean_code = clean_code.replace("const App =", "export default function App =")

    return clean_code.strip()

def is_text_intent(prompt: str) -> bool:
    """Detects if prompt is purely conversational / general question."""
    p = prompt.lower().strip()
    text_triggers = ["what is", "explain", "how does", "why is", "tell me about", "who is", "summary of", "difference between", "hello", "hi", "what's"]
    app_triggers = ["create", "build", "generate", "make", "app", "dashboard", "tracker", "calculator", "quiz", "game", "widget", "splitter", "poll", "timer", "component", "pitch deck", "presentation", "slides", "ppt", "add", "update", "modify", "change", "bmi"]

    if any(k in p for k in app_triggers):
        return False
    if any(k in p for k in text_triggers):
        return True
    return False

def route_and_generate(prompt: str, current_code: Optional[str] = None, template_id: Optional[str] = None) -> Dict[str, Any]:
    """Smart intent router using ultra-fast gemini-3.5-flash for sub-3s response speed."""
    if template_id and template_id in PRESET_TEMPLATES:
        return {
            "type": "app",
            "code": PRESET_TEMPLATES[template_id]["code"],
            "message": f"✨ Created {PRESET_TEMPLATES[template_id]['title']} on the canvas."
        }

    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and api_key != "your_gemini_api_key_here":
        try:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=api_key)
            
            context_prompt = f"USER PROMPT: {prompt}"
            if current_code and current_code.strip():
                context_prompt += f"\n\nEXISTING REACT CODE TO MODIFY:\n{current_code}"

            full_instructions = f"{SYSTEM_ROUTER_PROMPT}\n\n{context_prompt}"
            
            try:
                response = client.models.generate_content(
                    model='gemini-3.5-flash',
                    contents=full_instructions,
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        max_output_tokens=4096,
                        thinking_config=types.ThinkingConfig(thinking_budget=0)
                    )
                )
            except Exception:
                response = client.models.generate_content(
                    model='gemini-1.5-flash',
                    contents=full_instructions,
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        max_output_tokens=4096
                    )
                )

            raw_res = response.text or ""
            clean_code = clean_generated_code(raw_res)

            return {
                "type": "app",
                "code": clean_code,
                "message": "✨ Refined micro-app component on the canvas." if current_code else "✨ Generated micro-app component on the canvas."
            }
        except Exception as err:
            print(f"Gemini API warning: {err}, falling back to local intent router.")

    # Local fallback intent router engine if API key is not present
    if is_text_intent(prompt) and not (current_code and current_code.strip()):
        return {
            "type": "text",
            "content": f"**PromptToLife Assistant**\n\nI noticed your question: *\"{prompt}\"*.\n\nState is mutable local data managed within a component via `useState()`, while props are immutable parameters passed down from a parent component.\n\nWhenever you're ready, ask me to build any **dashboard, tracker, pitch deck, quiz, or tool** and I will construct and run it live on the right canvas!"
        }

    app_code = get_fallback_app(prompt, current_code)
    return {
        "type": "app",
        "code": clean_generated_code(app_code),
        "message": "✨ Updated micro-app component on the canvas." if current_code else "✨ Created micro-app component on the canvas."
    }
