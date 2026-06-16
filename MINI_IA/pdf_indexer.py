#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
╔══════════════════════════════════════════════════════════════════╗
║   INDEXADOR DE MANUALES PDF A CHROMADB CON OCR — MINI IA         ║
║   Alvarez Placas (Documentación Técnica)                         ║
╚══════════════════════════════════════════════════════════════════╝
"""

import os
import time
import glob
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import chromadb
import ollama

# Configurar ruta de Tesseract en Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Configuración
PDF_DIR = r"I:\PDF ALVAREZPLACAS\MANUALES"
CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "javiermix_docs"
EMBED_MODEL = "nomic-embed-text"
CHUNK_SIZE = 1000  # Caracteres por chunk
CHUNK_OVERLAP = 150 # Caracteres de superposición

def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP):
    """Divide el texto en chunks con solapamiento."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        if end >= len(text):
            break
        start = end - overlap
    return chunks

def extract_text_from_pdf_hybrid(pdf_path: str):
    """Extrae texto usando texto nativo o OCR si es necesario."""
    text_content = ""
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            # Intentar extracción nativa
            page_text = page.get_text()
            
            # Si el texto está vacío, o tiene caracteres corruptos de fuentes incrustadas (cid:), usar OCR
            if len(page_text.strip()) < 20 or "(cid:" in page_text:
                print(f"    [!] Página {page_num+1}: Texto nativo insuficiente o corrupto. Aplicando OCR...")
                # Renderizar página a imagen (resolución 300 DPI aprox para buen OCR)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                # Ejecutar OCR
                ocr_text = pytesseract.image_to_string(img, lang='spa+eng')
                text_content += ocr_text + "\n\n"
            else:
                text_content += page_text + "\n\n"
        doc.close()
    except Exception as e:
        print(f"Error procesando {pdf_path}: {e}")
    
    return text_content.strip()

def main():
    print("==========================================================")
    print(" INICIANDO INDEXACIÓN DE MANUALES CON OCR (ALVAREZ PLACAS) ")
    print("==========================================================")
    
    # 1. Encontrar todos los PDFs
    pdf_files = glob.glob(os.path.join(PDF_DIR, "*.pdf"))
    if not pdf_files:
        print(f"[Error] No se encontraron archivos PDF en {PDF_DIR}")
        return
        
    print(f"Encontrados {len(pdf_files)} manuales para procesar.")

    # 2. Conectar a ChromaDB local
    print(f"\nConectando a ChromaDB en '{CHROMA_PATH}'...")
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    print(f"Colección '{COLLECTION_NAME}' lista. Elementos actuales: {collection.count()}")

    # 3. Procesar PDFs
    total_chunks_indexed = 0
    t0 = time.time()
    
    for pdf_idx, pdf_path in enumerate(pdf_files):
        filename = os.path.basename(pdf_path)
        print(f"\n[{pdf_idx+1}/{len(pdf_files)}] Procesando: {filename}")
        
        # Extraer texto con Híbrido (Nativo + OCR)
        t_extract = time.time()
        text = extract_text_from_pdf_hybrid(pdf_path)
        
        if not text:
            print(f"  -> [Advertencia] No se pudo extraer texto ni con OCR. Se omitirá.")
            continue
            
        print(f"  -> Texto extraído ({len(text)} caracteres) en {round(time.time() - t_extract, 2)}s.")
        
        # Generar chunks
        chunks = chunk_text(text)
        print(f"  -> Generados {len(chunks)} fragmentos.")
        
        # Lotes de inserción para ChromaDB
        batch_size = 20
        ids_batch = []
        documents_batch = []
        metadatas_batch = []
        embeddings_batch = []
        
        for c_idx, chunk in enumerate(chunks):
            chunk_id = f"manual_{filename}_chunk_{c_idx}"
            
            # Formato enriquecido
            doc_text = (
                f"[Fragmento de Manual - Alvarez Placas]\n"
                f"Manual: {filename}\n"
                f"Contenido:\n{chunk}"
            )
            
            metadata = {
                "source": "PDF Manual",
                "type": "manual",
                "filename": filename,
                "chunk_index": c_idx
            }
            
            # Generar embedding
            try:
                resp = ollama.embeddings(model=EMBED_MODEL, prompt=doc_text)
                embedding = resp["embedding"]
                
                ids_batch.append(chunk_id)
                documents_batch.append(doc_text)
                metadatas_batch.append(metadata)
                embeddings_batch.append(embedding)
                
            except Exception as e:
                print(f"  -> [Error] generando embedding para {chunk_id}: {e}")
                continue
                
            # Insertar en base de datos en lotes
            if len(ids_batch) >= batch_size or c_idx == len(chunks) - 1:
                try:
                    collection.upsert(
                        ids=ids_batch,
                        embeddings=embeddings_batch,
                        documents=documents_batch,
                        metadatas=metadatas_batch
                    )
                    total_chunks_indexed += len(ids_batch)
                    print(f"    -> Indexados {c_idx+1}/{len(chunks)} fragmentos de {filename}...")
                except Exception as e:
                    print(f"  -> [Error] insertando lote en ChromaDB: {e}")
                    
                # Limpiar lote
                ids_batch = []
                documents_batch = []
                metadatas_batch = []
                embeddings_batch = []
                
    total_time = round(time.time() - t0, 2)
    print("\n==========================================================")
    print(f"¡INDEXACIÓN DE MANUALES CON OCR COMPLETADA EXITOSAMENTE!")
    print(f"Archivos procesados: {len(pdf_files)}")
    print(f"Fragmentos totales indexados: {total_chunks_indexed}")
    print(f"Tiempo total transcurrido: {total_time} segundos")
    print(f"Total de vectores en la base: {collection.count()}")
    print("==========================================================")

if __name__ == "__main__":
    main()
