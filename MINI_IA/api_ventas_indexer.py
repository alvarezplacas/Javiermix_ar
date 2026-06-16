#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
╔══════════════════════════════════════════════════════════════════╗
║   INDEXADOR DE PRODUCCIÓN EN TIEMPO REAL (API) — MINI IA         ║
║   Alvarez Placas                                                 ║
╚══════════════════════════════════════════════════════════════════╝
"""

import urllib.request
import json
import time
import chromadb
import ollama

# Configuración
API_URL = "http://100.94.20.127:3000/api/reporte"
CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "javiermix_docs"
EMBED_MODEL = "nomic-embed-text"

def fetch_data():
    try:
        req = urllib.request.Request(API_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read().decode('utf-8'))
    except Exception as e:
        print(f"[!] Error conectando a la API de ventas: {e}")
        return []

def main():
    print("==========================================================")
    print(" INICIANDO SINCRONIZACIÓN DE PRODUCCIÓN EN VIVO           ")
    print("==========================================================")
    
    data = fetch_data()
    if not data:
        print("No se obtuvieron datos de la API.")
        return
        
    print(f"Obtenidos {len(data)} registros de la API.")

    print(f"Conectando a ChromaDB en '{CHROMA_PATH}'...")
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    
    # 1. Borrar vectores antiguos de producción en vivo (para no tener datos viejos)
    print("Limpiando caché de producción anterior...")
    # ChromaDB permite borrar por metadata (en versiones modernas)
    try:
        collection.delete(where={"source": "Produccion API"})
    except Exception as e:
        print(f"Nota: No se pudo borrar la caché anterior: {e}")

    # 2. Generar nuevos vectores
    t0 = time.time()
    batch_size = 50
    ids_batch = []
    documents_batch = []
    metadatas_batch = []
    embeddings_batch = []
    
    indexed_count = 0
    for idx, item in enumerate(data):
        uid = item.get("uid", f"desconocido_{idx}")
        cliente = item.get("cliente", "Desconocido")
        factura = item.get("factura", "S/N")
        fecha = item.get("fecha", "")
        estado = item.get("estado", "")
        importe = item.get("importe", 0)
        saldo = item.get("saldopendiente", 0)
        
        detalles = item.get("detalles_json", [])
        descripciones = [f"{d.get('cant', 1)}x {d.get('descripcion', '')} (Produccion: {'Si' if d.get('a_produccion') else 'No'})" for d in detalles if isinstance(d, dict)]
        detalles_str = "\n  - ".join(descripciones) if descripciones else "Sin detalles"
        
        doc_text = (
            f"[Estado de Producción y Ventas - En Vivo]\n"
            f"Factura: {factura}\n"
            f"Cliente: {cliente}\n"
            f"Fecha: {fecha}\n"
            f"Importe Total: ${importe}\n"
            f"Saldo Pendiente: ${saldo}\n"
            f"Estado de Pago: {estado}\n"
            f"Artículos de la compra:\n  - {detalles_str}\n"
        )
        
        doc_id = f"prod_vivo_{uid}_{idx}"
        metadata = {
            "source": "Produccion API",
            "type": "venta_vivo",
            "cliente": str(cliente),
            "estado": str(estado)
        }
        
        try:
            resp = ollama.embeddings(model=EMBED_MODEL, prompt=doc_text)
            ids_batch.append(doc_id)
            documents_batch.append(doc_text)
            metadatas_batch.append(metadata)
            embeddings_batch.append(resp["embedding"])
        except Exception as e:
            print(f"Error generando embedding para {doc_id}: {e}")
            continue
            
        if len(ids_batch) >= batch_size or idx == len(data) - 1:
            try:
                collection.add(
                    ids=ids_batch,
                    embeddings=embeddings_batch,
                    documents=documents_batch,
                    metadatas=metadatas_batch
                )
                indexed_count += len(ids_batch)
                print(f"  -> Indexados {indexed_count}/{len(data)} registros de producción...")
            except Exception as e:
                print(f"Error insertando lote en ChromaDB: {e}")
                
            ids_batch, documents_batch, metadatas_batch, embeddings_batch = [], [], [], []
            
    print(f"¡Sincronización de Producción Completada! ({round(time.time()-t0, 2)}s)")

if __name__ == "__main__":
    main()
