# ⚡ PromptToLife AI (Micro-App Studio)

> **Instant natural language to live interactive React micro-apps sandboxed in-browser.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![CodeSandbox Sandpack](https://img.shields.io/badge/Sandpack-React_Sandbox-151515?style=for-the-badge&logo=codesandbox)](https://sandpack.codesandbox.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)

---

## 📖 Overview

**PromptToLife AI** is a full-stack, real-time AI Micro-App Studio inspired by Claude Artifacts, Vercel v0, and Linear. It enables users to describe any interactive app idea (e.g. *Trip Budget Calculators, Fitness Trackers, Flashcard Quiz Arenas, Pomodoro Hubs*) in plain English and instantly compiles, runs, and renders pure React code live in an isolated browser sandbox.

---

## ✨ Key Features

- **⚡ Instant Real-Time Synthesis**: Powered by Google Gemini 3.5 Flash (`thinking_budget=0`) to deliver sub-3s code generation response times.
- **📱 Live Sandpack Sandbox**: In-browser execution of React, TypeScript, Tailwind CSS, and Lucide icons without requiring backend compilation servers.
- **🖥️ Responsive Device Switcher**: Seamlessly toggle between Desktop (100% full-width) and Mobile (375px centered container) viewports with smooth Framer Motion spring physics.
- **🔄 Iterative Chat & Code Refinement**: Maintains conversational code context so follow-up prompts modify active React components dynamically instead of starting from scratch.
- **🛡️ Production Hardening**: Built with SlowAPI rate-limiting (`10 req/min/IP`) and `asyncio.Semaphore(10)` concurrency queues to protect against high traffic spikes.
- **📋 One-Click Copy**: Copy pure React component code directly to clipboard.

---

## 🛠️ Architecture & Tech Stack

```
           ┌──────────────────────────────────────────────┐
           │            Next.js App Router                │
           │       TypeScript + Tailwind CSS              │
           └──────────────────────┬───────────────────────┘
                                  │
                                  ▼
           ┌──────────────────────────────────────────────┐
           │        FastAPI Server (Python 3.11+)         │
           │      SlowAPI + asyncio.Semaphore(10)         │
           └──────────────────────┬───────────────────────┘
                                  │
                                  ▼
           ┌──────────────────────────────────────────────┐
           │        Google Gemini 3.5 Flash AI            │
           │     (google-genai Python SDK Engine)         │
           └──────────────────────────────────────────────┘
```

### **Frontend**:
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS, Frosted Glassmorphism, Dark Mesh Gradient Aurora
- **Sandbox Runner**: `@codesandbox/sandpack-react`
- **Animations**: `framer-motion`
- **Icons**: `lucide-react`

### **Backend**:
- **Framework**: FastAPI + Uvicorn
- **AI Model**: Google Gemini 3.5 Flash (`google-genai` SDK)
- **Rate Limiting**: `slowapi` (10 requests/minute per IP)
- **Concurrency**: `asyncio.Semaphore(10)` with 45-second fallback guards

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11 or higher
- **Google Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env
```

Open `backend/.env` and add your Google Gemini API key:
```env
PORT=8000
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the FastAPI backend server:
```bash
python -m uvicorn main:app --port 8000 --reload
```

---

### 3. Frontend Setup (Next.js)

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using PromptToLife AI!

---

## 📁 Repository Structure

```
PromptToLife-AI/
├── frontend/                 # Next.js App Router Client
│   ├── src/
│   │   ├── app/              # Layout, Global CSS, Page Entry Point
│   │   ├── components/       # Header, PromptPanel, CodeCanvas, PresetPills
│   │   └── lib/              # API Client Services
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # FastAPI Server
│   ├── main.py               # Rate limiting, CORS, Semaphore API routes
│   ├── generator.py          # Gemini 3.5 Flash AI synthesis engine
│   ├── generator_fallback.py # Local fallback intent router
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variable template
│   └── .env                  # Environment variables (gitignored)
│
├── .gitignore                # Root gitignore protecting secrets & build files
└── README.md                 # Project Documentation
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**Pari Garg**  
- GitHub: [@Parigarg2006](https://github.com/Parigarg2006)  
- Repository: [PromptToLife-AI](https://github.com/Parigarg2006/PromptToLife-AI)
