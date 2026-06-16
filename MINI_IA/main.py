"""
╔══════════════════════════════════════════════════════════════════╗
║   CEREBRO COGNITIVO — MINI IA  |  Nodo 3 (i7) — Javiermix      ║
║   FastAPI + Ollama + ChromaDB                                    ║
║   Endpoints:                                                     ║
║     GET  /api/chat/status          → Estado del sistema          ║
║     POST /api/chat/query           → Consulta RAG                ║
║     POST /api/documents/index      → Indexar texto plano         ║
║     POST /api/documents/index-pdf  → Indexar PDF                ║
║     GET  /api/documents/list       → Listar documentos           ║
╚══════════════════════════════════════════════════════════════════╝
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import asyncio
import glob
from ocr_pipeline import generate_ebook_task, INBOX_DIR
import chromadb
import ollama
import requests
import tempfile
import os
import time
import logging

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
log = logging.getLogger("mini_ia")

# ── Configuración ──────────────────────────────────────────────────────────────
OLLAMA_HOST      = os.getenv("OLLAMA_HOST",   "http://localhost:11434")
LLM_MODEL        = os.getenv("LLM_MODEL",     "llama3")
EMBED_MODEL      = os.getenv("EMBED_MODEL",   "nomic-embed-text")
CHROMA_PATH      = os.getenv("CHROMA_PATH",   "./chroma_db")
COLLECTION_NAME  = os.getenv("COLLECTION",    "javiermix_docs")
TOP_K            = int(os.getenv("TOP_K",     "4"))

# ── ChromaDB ───────────────────────────────────────────────────────────────────
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection    = chroma_client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)

# ── FastAPI ────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Cerebro Cognitivo — Mini IA",
    description="RAG local con Ollama + ChromaDB para el ecosistema Javiermix/Alvarez Placas",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir Dashboard estático
app.mount("/ocr_dashboard", StaticFiles(directory="public", html=True), name="ocr_dashboard")

# ══════════════════════════════════════════════════════════════════════════════
#  MODELOS PYDANTIC
# ══════════════════════════════════════════════════════════════════════════════

class QueryRequest(BaseModel):
    question:   Optional[str] = None
    query:      Optional[str] = None
    collection: Optional[str] = None
    top_k:      Optional[int] = None
    history:    Optional[list] = []

class IndexRequest(BaseModel):
    text:     str
    doc_id:   str
    metadata: Optional[dict] = {}

class OcrGenerateRequest(BaseModel):
    title: str

class QueryResponse(BaseModel):
    success:  bool = True
    answer:   str
    sources:  list
    latency_ms: float

# ══════════════════════════════════════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _check_ollama() -> bool:
    """Verifica si Ollama responde en el host configurado."""
    try:
        r = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=3)
        return r.status_code == 200
    except Exception:
        return False

def _embed(text: str) -> list[float]:
    """Genera embedding usando Ollama."""
    resp = ollama.embeddings(model=EMBED_MODEL, prompt=text)
    return resp["embedding"]

def _get_collection(name: Optional[str] = None):
    if name and name != COLLECTION_NAME:
        return chroma_client.get_or_create_collection(
            name=name,
            metadata={"hnsw:space": "cosine"}
        )
    return collection

# ══════════════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/chat/status", tags=["Sistema"])
def status():
    """Retorna el estado de la API y de Ollama."""
    ollama_ok = _check_ollama()
    docs_count = collection.count()
    return {
        "api":        "online",
        "ollama":     "online" if ollama_ok else "offline",
        "ollama_host": OLLAMA_HOST,
        "llm_model":  LLM_MODEL,
        "embed_model": EMBED_MODEL,
        "collection": COLLECTION_NAME,
        "docs_indexed": docs_count,
        "chroma_path": CHROMA_PATH,
    }


@app.post("/api/chat/query", response_model=QueryResponse, tags=["Chat"])
def query_rag(req: QueryRequest):
    """Consulta RAG: busca contexto en ChromaDB y genera respuesta con Ollama."""
    t0 = time.time()

    if not _check_ollama():
        raise HTTPException(503, "Ollama no disponible. Ejecutá 'ollama serve'.")

    # Extraer la pregunta (soporta 'question' o 'query')
    question_text = req.question or req.query
    if not question_text:
        raise HTTPException(400, "Se requiere 'question' o 'query' en la petición.")

    col   = _get_collection(req.collection)
    top_k = req.top_k or TOP_K

    # 1. Embedding de la pregunta
    try:
        q_embed = _embed(question_text)
    except Exception as e:
        raise HTTPException(500, f"Error generando embedding: {e}")

    # 2. Búsqueda vectorial
    results = col.query(
        query_embeddings=[q_embed],
        n_results=min(top_k, max(col.count(), 1)),
        include=["documents", "metadatas", "distances"]
    )

    docs  = results["documents"][0]  if results["documents"]  else []
    metas = results["metadatas"][0]  if results["metadatas"]  else []
    dists = results["distances"][0]  if results["distances"]  else []

    # 3. Construir contexto
    if docs:
        context_parts = []
        for i, (doc, meta) in enumerate(zip(docs, metas)):
            src = meta.get("source", "desconocido")
            context_parts.append(f"[Fuente {i+1} — {src}]\n{doc}")
        context = "\n\n---\n\n".join(context_parts)
    else:
        context = "No hay documentos indexados relevantes."

    # 4. Prompt RAG
    system_prompt = (
        "Eres un asistente técnico experto del ecosistema Javiermix y Alvarez Placas. "
        "Responde SIEMPRE en español, de forma clara, precisa y profesional. "
        "Basa tus respuestas EXCLUSIVAMENTE en el contexto proporcionado. "
        "Si el contexto no contiene la información, indícalo honestamente."
    )
    user_prompt = (
        f"Contexto recuperado:\n\n{context}\n\n"
        f"---\n\nPregunta: {question_text}\n\n"
        "Respuesta:"
    )

    # 5. Inferencia LLM
    try:
        response = ollama.chat(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ]
        )
        answer = response["message"]["content"]
    except Exception as e:
        raise HTTPException(500, f"Error en inferencia LLM: {e}")

    latency = round((time.time() - t0) * 1000, 1)
    sources = [
        {"source": m.get("source", "?"), "distance": round(d, 4)}
        for m, d in zip(metas, dists)
    ]

    log.info(f"Query '{question_text[:60]}...' → {len(docs)} docs, {latency}ms")
    return QueryResponse(success=True, answer=answer, sources=sources, latency_ms=latency)


@app.post("/api/documents/index", tags=["Documentos"], status_code=201)
def index_text(req: IndexRequest):
    """Indexa un fragmento de texto en ChromaDB."""
    try:
        embedding = _embed(req.text)
    except Exception as e:
        raise HTTPException(500, f"Error generando embedding: {e}")

    col = _get_collection()
    col.upsert(
        ids=[req.doc_id],
        embeddings=[embedding],
        documents=[req.text],
        metadatas=[req.metadata or {}],
    )
    log.info(f"Indexado: {req.doc_id}")
    return {"status": "indexed", "doc_id": req.doc_id, "collection": COLLECTION_NAME}


@app.post("/api/documents/index-pdf", tags=["Documentos"], status_code=201)
async def index_pdf(file: UploadFile = File(...), source_name: Optional[str] = None):
    """Sube y indexa un PDF. Extrae texto página por página con pdfplumber."""
    try:
        import pdfplumber
    except ImportError:
        raise HTTPException(500, "pdfplumber no instalado. Ejecutá: pip install pdfplumber")

    suffix = os.path.splitext(file.filename)[-1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    name = source_name or file.filename
    indexed = 0
    errors  = []

    try:
        with pdfplumber.open(tmp_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if not text or len(text.strip()) < 30:
                    continue
                doc_id = f"{name}__p{page_num}"
                try:
                    emb = _embed(text)
                    collection.upsert(
                        ids=[doc_id],
                        embeddings=[emb],
                        documents=[text],
                        metadatas=[{"source": name, "page": page_num}],
                    )
                    indexed += 1
                except Exception as e:
                    errors.append(f"Página {page_num}: {e}")
    finally:
        os.unlink(tmp_path)

    log.info(f"PDF '{name}': {indexed} páginas indexadas")
    return {
        "status":  "indexed",
        "source":  name,
        "pages_indexed": indexed,
        "errors":  errors,
        "collection": COLLECTION_NAME,
    }


@app.get("/api/documents/list", tags=["Documentos"])
def list_documents(limit: int = 50):
    """Lista los documentos indexados en la colección."""
    count = collection.count()
    if count == 0:
        return {"total": 0, "documents": []}

    results = collection.get(
        limit=min(limit, count),
        include=["metadatas", "documents"]
    )
    docs = [
        {
            "id":       results["ids"][i],
            "source":   results["metadatas"][i].get("source", "?"),
            "preview":  results["documents"][i][:120] + "..." if len(results["documents"][i]) > 120 else results["documents"][i],
        }
        for i in range(len(results["ids"]))
    ]
    return {"total": count, "documents": docs}


# ══════════════════════════════════════════════════════════════════════════════
#  ENDPOINTS OCR LIBROS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/ocr/status", tags=["OCR Libros"])
def ocr_status():
    """Retorna el estado del buzón de imágenes para procesar."""
    if not os.path.exists(INBOX_DIR):
        os.makedirs(INBOX_DIR)
        
    exts = ["*.jpg", "*.jpeg", "*.png"]
    count = 0
    for ext in exts:
        count += len(glob.glob(os.path.join(INBOX_DIR, ext)))
        count += len(glob.glob(os.path.join(INBOX_DIR, ext.upper())))
        
    return {"status": "ok", "pending_images": count, "inbox_dir": INBOX_DIR}

def _run_ocr_sync(title: str):
    """Wrapper sincrónico para ejecutar la tarea asincrónica de OCR."""
    asyncio.run(generate_ebook_task(title))

@app.post("/api/ocr/generate", tags=["OCR Libros"], status_code=202)
def start_ocr_generation(req: OcrGenerateRequest, background_tasks: BackgroundTasks):
    """Inicia el proceso de OCR en segundo plano."""
    # Verificamos si hay imágenes antes de arrancar
    status_info = ocr_status()
    if status_info["pending_images"] == 0:
        raise HTTPException(400, "No hay imágenes en el buzón (onevision_scanner).")
        
    # Añadir a las tareas de fondo de FastAPI
    background_tasks.add_task(_run_ocr_sync, req.title)
    return {"status": "accepted", "message": f"Generación iniciada para '{req.title}' en segundo plano."}

# ══════════════════════════════════════════════════════════════════════════════
#  ENTRYPOINT
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    log.info(f"🧠 Cerebro Cognitivo arrancando en puerto {port}...")
    log.info(f"   Ollama: {OLLAMA_HOST}  |  LLM: {LLM_MODEL}  |  Embed: {EMBED_MODEL}")
    log.info(f"   ChromaDB: {CHROMA_PATH}  |  Colección: {COLLECTION_NAME}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
