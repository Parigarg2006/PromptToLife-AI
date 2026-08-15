from typing import Optional

def get_fallback_app(prompt: str, current_code: Optional[str] = None) -> str:
    """Generates authentic category-aware React apps, slide decks, or updates existing code."""
    p = prompt.lower()
    
    # Refinement iteration handling
    if current_code and ("dark" in p or "mode" in p or "inr" in p or "rupee" in p or "add" in p or "currency" in p):
        modified = current_code
        if "inr" in p or "rupee" in p or "currency" in p:
            modified = modified.replace("$", "₹")
        return modified

    # Specific category: Presentation / Pitch Deck
    if "deck" in p or "presentation" in p or "slide" in p or "pitch" in p or "ppt" in p:
        return """import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Layers, ArrowRight, ShieldCheck, Zap, TrendingUp, Users } from 'lucide-react';

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badge: 'VISION & MISSION',
      title: 'PromptToLife AI',
      subtitle: 'The Next-Generation Instant Micro-App Engine',
      description: 'Transforming natural language prompts into live interactive React micro-apps sandboxed directly in the browser.',
      metrics: [
        { label: 'Generation Speed', val: '< 3.0s' },
        { label: 'Client Safety', val: '100% In-Browser' },
        { label: 'Target Market', val: '$45B Low-Code' }
      ]
    },
    {
      id: 2,
      badge: 'THE PROBLEM',
      title: 'Traditional Web Development is Too Slow',
      subtitle: 'Building simple internal tools or pitch prototypes takes days of manual coding and environment setup.',
      bullets: [
        'High engineering costs for simple internal utility widgets',
        'Complex deployment pipelines & CORS backend configurations',
        'Slow iteration feedback loops during user validation'
      ]
    },
    {
      id: 3,
      badge: 'THE SOLUTION',
      title: 'Natural Language to Executable Code',
      subtitle: 'Sandboxed client-side execution powered by Google Gemini 3.5 Flash and Sandpack.',
      bullets: [
        'Instant compilation of pure React components with Tailwind CSS & Lucide icons',
        'Zero-setup isolated client execution inside browser Sandpack container',
        'Iterative context refinement for follow-up code updates'
      ]
    },
    {
      id: 4,
      badge: 'BUSINESS MODEL & GROWTH',
      title: 'Scalable Enterprise & Developer Pricing',
      subtitle: 'Monetizing through developer API usage and custom team workspaces.',
      metrics: [
        { label: 'Pro Tier', val: '$29/mo' },
        { label: 'Team Workspace', val: '$99/mo' },
        { label: 'Projected ARR', val: '$1.2M Y1' }
      ]
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '32px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
      {/* Top Slide Header Progress */}
      <div style={{ maxWidth: '840px', width: '100%', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
          <span style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '-0.2px' }}>PitchStudio</span>
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', border: '1px solid #1e293b' }}>
          Slide {currentSlide + 1} of {slides.length}
        </div>
      </div>

      {/* Main Slide Presentation Content Card */}
      <div style={{ maxWidth: '840px', width: '100%', margin: '0 auto', background: 'linear-gradient(135deg, #0f172a, #0b1329)', border: '1px solid #1e293b', borderRadius: '24px', padding: '48px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', display: 'inline-block' }}>
          {slide.badge}
        </span>

        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.8px', lineHeight: '1.2' }}>
          {slide.title}
        </h1>

        <p style={{ fontSize: '16px', color: '#94a3b8', margin: '0 0 32px 0', lineHeight: '1.6' }}>
          {slide.subtitle}
        </p>

        {slide.description && (
          <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.7', background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: '14px', border: '1px solid #1e293b' }}>
            {slide.description}
          </p>
        )}

        {slide.metrics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {slide.metrics.map((m, i) => (
              <div key={i} style={{ background: '#090d16', border: '1px solid #1e293b', padding: '20px', borderRadius: '16px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{m.label}</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b', marginTop: '6px' }}>{m.val}</div>
              </div>
            ))}
          </div>
        )}

        {slide.bullets && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {slide.bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#090d16', padding: '14px 18px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <ArrowRight style={{ width: '16px', height: '16px', color: '#f59e0b', shrink: 0 }} />
                <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{b}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Controls Bar */}
      <div style={{ maxWidth: '840px', width: '100%', margin: '24px auto 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Use <kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>←</kbd> <kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>→</kbd> keys to navigate
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            style={{ background: '#1e293b', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', opacity: currentSlide === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ChevronLeft style={{ width: '16px' }} /> Prev
          </button>
          <button
            onClick={() => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))}
            disabled={currentSlide === slides.length - 1}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', opacity: currentSlide === slides.length - 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            Next <ChevronRight style={{ width: '16px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
"""

    # Specific category: BMI / Fitness / Health Calculator
    if "bmi" in p or "fitness" in p or "weight" in p or "health" in p or "calorie" in p:
        return """import React, { useState, useMemo } from 'react';
import { Activity, Heart, Scale, Flame, RefreshCw } from 'lucide-react';

export default function App() {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);

  const bmiData = useMemo(() => {
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    const val = parseFloat(bmi);
    
    let category = 'Normal';
    let color = '#06b6d4';
    let statusText = 'Healthy weight range';

    if (val < 18.5) {
      category = 'Underweight';
      color = '#38bdf8';
      statusText = 'Below recommended range';
    } else if (val >= 18.5 && val < 25) {
      category = 'Normal';
      color = '#10b981';
      statusText = 'Optimal healthy weight';
    } else if (val >= 25 && val < 30) {
      category = 'Overweight';
      color = '#f59e0b';
      statusText = 'Above recommended range';
    } else {
      category = 'Obese';
      color = '#ef4444';
      statusText = 'High body fat concentration';
    }

    return { bmi: val, category, color, statusText };
  }, [height, weight]);

  return (
    <div style={{ minHeight: '100vh', background: '#080e14', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', padding: '12px', borderRadius: '14px', boxShadow: '0 8px 24px rgba(6, 182, 212, 0.25)', display: 'flex' }}>
              <Activity style={{ width: '24px', height: '24px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>FitPulse</h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Body Mass Index & Health Metrics</p>
            </div>
          </div>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>
            Health Assessment
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0f172a, #0b1329)', border: '1px solid #1e293b', borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Calculated BMI</div>
          <div style={{ fontSize: '64px', fontWeight: '900', margin: '12px 0', color: bmiData.color }}>
            {bmiData.bmi}
          </div>
          
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', border: `1px solid ${bmiData.color}`, padding: '6px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '700', color: bmiData.color, marginBottom: '12px' }}>
            {bmiData.category}
          </div>
          
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>{bmiData.statusText}</div>

          <div style={{ display: 'flex', gap: '4px', marginTop: '24px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ flex: 18.5, background: '#38bdf8' }} />
            <div style={{ flex: 6.5, background: '#10b981' }} />
            <div style={{ flex: 5, background: '#f59e0b' }} />
            <div style={{ flex: 10, background: '#ef4444' }} />
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>Height</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8' }}>{height} cm</span>
            </div>
            <input
              type="range"
              min="120"
              max="220"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4', height: '6px', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>Weight</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8' }}>{weight} kg</span>
            </div>
            <input
              type="range"
              min="30"
              max="160"
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4', height: '6px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
"""

    clean_title = prompt.strip().capitalize()
    return f"""import React, { useState } from 'react';
import {{ Sparkles, Plus, Trash2 }} from 'lucide-react';

export default function App() {{
  const [items, setItems] = useState([
    {{ id: 1, name: 'Sample Entry A', status: 'Active' }},
    {{ id: 2, name: 'Sample Entry B', status: 'Completed' }},
  ]);
  const [val, setVal] = useState('');

  const handleAdd = (e) => {{
    e.preventDefault();
    if (!val.trim()) return;
    setItems([...items, {{ id: Date.now(), name: val, status: 'Active' }}]);
    setVal('');
  }};

  const handleRemove = (id) => {{
    setItems(items.filter(i => i.id !== id));
  }};

  return (
    <div style={{{{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '24px' }}}}>
      <div style={{{{ maxWidth: '640px', margin: '0 auto' }}}}>
        <div style={{{{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}}}>
          <div style={{{{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', padding: '12px', borderRadius: '14px', display: 'flex' }}}}>
            <Sparkles style={{{{ color: '#fff', width: '24px', height: '24px' }}}} />
          </div>
          <div>
            <h1 style={{{{ margin: 0, fontSize: '22px', fontWeight: '800' }}}}>{clean_title}</h1>
            <p style={{{{ margin: '2px 0 0 0', fontSize: '13px', color: '#94a3b8' }}}}>Interactive Workspace Studio</p>
          </div>
        </div>

        <form onSubmit={{handleAdd}} style={{{{ display: 'flex', gap: '10px', marginBottom: '24px' }}}}>
          <input
            type="text"
            placeholder="Add new item..."
            value={{val}}
            onChange={{(e) => setVal(e.target.value)}}
            style={{{{ flex: 1, background: '#172033', border: '1px solid #2a3754', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}}}
          />
          <button type="submit" style={{{{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}}}>
            <Plus style={{{{ width: '18px' }}}} /> Add
          </button>
        </form>

        <div style={{{{ background: '#172033', border: '1px solid #2a3754', borderRadius: '18px', padding: '20px' }}}}>
          <h3 style={{{{ margin: '0 0 16px 0', fontSize: '15px' }}}}>Items ({{items.length}})</h3>
          <div style={{{{ display: 'flex', flexDirection: 'column', gap: '10px' }}}}>
            {{items.map(item => (
              <div key={{item.id}} style={{{{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0b0f19', padding: '12px 16px', borderRadius: '12px', border: '1px solid #2a3754' }}}}>
                <span style={{{{ fontSize: '14px' }}}}>{{item.name}}</span>
                <button onClick={{() => handleRemove(item.id)}} style={{{{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}}}>
                  <Trash2 style={{{{ width: '16px' }}}} />
                </button>
              </div>
            ))}}
          </div>
        </div>
      </div>
    </div>
  );
}}
"""
