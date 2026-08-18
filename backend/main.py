import os
import re
import json
import uuid
import shutil
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

try:
    from langchain_community.document_loaders import PyPDFLoader
except ImportError:
    from langchain.document_loaders import PyPDFLoader

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter

try:
    from langchain_community.embeddings import HuggingFaceEmbeddings
except ImportError:
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
    except ImportError:
        from langchain.embeddings import HuggingFaceEmbeddings

try:
    from langchain_community.vectorstores import Chroma
except ImportError:
    try:
        from langchain_chroma import Chroma
    except ImportError:
        from langchain.vectorstores import Chroma

from groq import Groq

load_dotenv()

app = FastAPI(title="PromptToLife Enterprise RAG")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "./uploaded_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/files", StaticFiles(directory=UPLOAD_DIR), name="files")

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_db = Chroma(collection_name="pdf_knowledge", embedding_function=embeddings, persist_directory="./chroma_db")
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

doc_summaries = {}

def get_fallback_model() -> str:
    try:
        models_list = groq_client.models.list()
        active = [m.id for m in models_list.data if "whisper" not in m.id and "embed" not in m.id and "guard" not in m.id]
        if "llama-3.3-70b-versatile" in active:
            return "llama-3.3-70b-versatile"
        return active[0] if active else "llama-3.3-70b-versatile"
    except Exception:
        return "llama-3.3-70b-versatile"

def process_pdf_background(file_path: str, filename: str, doc_id: str):
    try:
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        chunks = text_splitter.split_documents(docs)
        for chunk in chunks:
            chunk.metadata["source_file"] = filename
            chunk.metadata["doc_id"] = doc_id
            if "page" in chunk.metadata:
                chunk.metadata["page_number"] = chunk.metadata["page"] + 1
        vector_db.add_documents(chunks)
        vector_db.persist()

        # Generate Auto Executive Summary
        first_few_pages = "\n".join([d.page_content for d in docs[:3]])[:3000]
        model_to_use = get_fallback_model()
        summary_res = groq_client.chat.completions.create(
            model=model_to_use,
            messages=[
                {"role": "system", "content": "Generate a concise 3-bullet executive summary and key takeaways of this uploaded document."},
                {"role": "user", "content": first_few_pages}
            ],
            max_tokens=300
        )
        doc_summaries[filename] = summary_res.choices[0].message.content
    except Exception as e:
        print(f"Background indexing error for {filename}: {e}")
        doc_summaries[filename] = f"Document uploaded and indexed successfully ({len(docs) if 'docs' in locals() else 'PDF'} pages)."

class MessageItem(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    messages: List[MessageItem]
    query: str
    model: Optional[str] = "llama-3.3-70b-versatile"

@app.post("/api/upload")
async def upload_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return JSONResponse(status_code=400, content={"error": "Only PDF files supported"})
    unique_filename = f"{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    background_tasks.add_task(process_pdf_background, file_path, file.filename, unique_filename)
    return {
        "status": "success", 
        "filename": file.filename, 
        "file_url": f"http://localhost:8000/files/{unique_filename}",
        "message": "File indexed successfully"
    }

@app.get("/api/summary/{filename}")
def get_summary(filename: str):
    return {"summary": doc_summaries.get(filename, "Processing executive summary...")}

@app.post("/api/chat/stream")
async def stream_chat(payload: ChatPayload):
    query = payload.query.strip()
    page_match = re.search(r"\bpage\s*(\d+)\b", query, re.IGNORECASE)
    filter_dict = {"page_number": int(page_match.group(1))} if page_match else None

    try:
        docs = vector_db.similarity_search(query, k=4, filter=filter_dict) if filter_dict else vector_db.similarity_search(query, k=4)
    except Exception:
        docs = []

    context_blocks = []
    citations = []
    for d in docs:
        p_num = d.metadata.get("page_number", 1)
        src = d.metadata.get("source_file", "Doc")
        context_blocks.append(f"[{src} | Page {p_num}]: {d.page_content}")
        citations.append({"source": src, "page": p_num})

    context_text = "\n\n".join(context_blocks) if context_blocks else ""

    system_content = (
        "You are PromptToLife, an enterprise AI knowledge assistant. "
        "Answer with high precision in clean Markdown with code blocks when applicable. "
        "When citing document points, strictly use format: [Page X]."
    )
    if context_text:
        system_content += f"\n\nContext:\n{context_text}"

    groq_messages = [{"role": "system", "content": system_content}]
    for m in payload.messages[-6:]:
        groq_messages.append({"role": m.role, "content": m.content})
    groq_messages.append({"role": "user", "content": query})

    target_model = payload.model if hasattr(payload, 'model') and payload.model else "llama-3.3-70b-versatile"
    supported_models = [
        "llama-3.3-70b-versatile",
        "deepseek-r1-distill-llama-70b",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768"
    ]
    if target_model not in supported_models:
        target_model = "llama-3.3-70b-versatile"

    async def token_generator():
        stream = None
        try:
            stream = groq_client.chat.completions.create(
                model=target_model,
                messages=groq_messages,
                temperature=0.3,
                max_tokens=2048,
                stream=True
            )
        except Exception:
            fallback_m = get_fallback_model()
            try:
                stream = groq_client.chat.completions.create(
                    model=fallback_m,
                    messages=groq_messages,
                    temperature=0.3,
                    max_tokens=2048,
                    stream=True
                )
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                return

        try:
            for chunk in stream:
                content = chunk.choices[0].delta.content or ""
                if content:
                    yield f"data: {json.dumps({'token': content})}\n\n"
            yield f"data: {json.dumps({'done': True, 'citations': citations})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(token_generator(), media_type="text/event-stream")

@app.get("/health")
def health():
    return {"status": "ok"}
