#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
╔══════════════════════════════════════════════════════════════════╗
║   INDEXADOR DE FACTURAS VPS EN TIEMPO REAL — MINI IA             ║
║   Alvarez Placas                                                 ║
╚══════════════════════════════════════════════════════════════════╝
"""

import os
import time
import json
import paramiko
import chromadb
import ollama
from pdf_indexer import extract_text_from_pdf_hybrid, chunk_text

VPS_IP = "144.217.163.13"
VPS_USER = "root"
VPS_PASS = "Tecno121212"
VPS_DIR = "/opt/alvarez_v16/web01/site/web01/private/facturas/"

LOCAL_PDF_TMP = "./tmp_facturas"
PROCESSED_LOG = "./facturas_procesadas.json"

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "javiermix_docs"
EMBED_MODEL = "nomic-embed-text"

def get_processed_files():
    if os.path.exists(PROCESSED_LOG):
        with open(PROCESSED_LOG, "r") as f:
            return json.load(f)
    return []

def mark_as_processed(filename, processed_list):
    processed_list.append(filename)
    with open(PROCESSED_LOG, "w") as f:
        json.dump(processed_list, f)

def download_new_facturas(processed_list):
    new_files = []
    if not os.path.exists(LOCAL_PDF_TMP):
        os.makedirs(LOCAL_PDF_TMP)
        
    try:
        transport = paramiko.Transport((VPS_IP, 22))
        transport.connect(username=VPS_USER, password=VPS_PASS)
        sftp = paramiko.SFTPClient.from_transport(transport)
        
        files = sftp.listdir(VPS_DIR)
        for f in files:
            if f.lower().endswith(".pdf") and f not in processed_list:
                local_path = os.path.join(LOCAL_PDF_TMP, f)
                remote_path = os.path.join(VPS_DIR, f).replace("\\", "/")
                print(f"Descargando nueva factura: {f}")
                sftp.get(remote_path, local_path)
                new_files.append(local_path)
                
        sftp.close()
        transport.close()
    except Exception as e:
        print(f"[!] Error SFTP VPS: {e}")
        
    return new_files

def main():
    print("==========================================================")
    print(" INICIANDO DESCARGA E INDEXACIÓN DE FACTURAS VPS          ")
    print("==========================================================")
    
    processed_list = get_processed_files()
    new_pdfs = download_new_facturas(processed_list)
    
    if not new_pdfs:
        print("No hay nuevas facturas en el VPS.")
        return
        
    print(f"Procesando {len(new_pdfs)} facturas nuevas con OCR...")
    
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME, metadata={"hnsw:space": "cosine"})
    
    indexed_count = 0
    t0 = time.time()
    
    for pdf_path in new_pdfs:
        filename = os.path.basename(pdf_path)
        print(f"\nProcesando: {filename}")
        
        text = extract_text_from_pdf_hybrid(pdf_path)
        if not text:
            print(f"  -> Error: no se extrajo texto de {filename}")
            mark_as_processed(filename, processed_list)
            continue
            
        chunks = chunk_text(text)
        
        ids_batch, docs_batch, metas_batch, embeds_batch = [], [], [], []
        for c_idx, chunk in enumerate(chunks):
            chunk_id = f"vps_factura_{filename}_{c_idx}"
            from datetime import datetime
            hoy = datetime.now().strftime("%d/%m/%Y")
            doc_text = (
                f"[Documento VPS - Factura / Remito]\n"
                f"Archivo: {filename}\n"
                f"Fecha de Procesamiento: {hoy}\n"
                f"Contenido Extraído:\n{chunk}"
            )
            metadata = {
                "source": "VPS Facturas",
                "type": "factura_vps",
                "filename": filename,
                "fecha_procesamiento": hoy
            }
            
            try:
                resp = ollama.embeddings(model=EMBED_MODEL, prompt=doc_text)
                ids_batch.append(chunk_id)
                docs_batch.append(doc_text)
                metas_batch.append(metadata)
                embeds_batch.append(resp["embedding"])
            except Exception as e:
                print(f"Error embedding chunk {c_idx}: {e}")
                
        if ids_batch:
            try:
                collection.upsert(
                    ids=ids_batch,
                    embeddings=embeds_batch,
                    documents=docs_batch,
                    metadatas=metas_batch
                )
                indexed_count += len(ids_batch)
                mark_as_processed(filename, processed_list)
                print(f"  -> {len(ids_batch)} fragmentos guardados.")
            except Exception as e:
                print(f"Error insertando {filename} en ChromaDB: {e}")
                
        # Opcional: borrar el archivo temporal para ahorrar espacio
        try:
            os.remove(pdf_path)
        except:
            pass
            
    print(f"\n¡Procesamiento de Facturas VPS Terminado! ({round(time.time()-t0, 2)}s)")

if __name__ == "__main__":
    main()
