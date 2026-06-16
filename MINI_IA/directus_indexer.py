#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
╔══════════════════════════════════════════════════════════════════╗
║   INDEXADOR DE DIRECTUS A CHROMADB — MINI IA                     ║
║   Alvarez Placas (Productos RAG)                                 ║
╚══════════════════════════════════════════════════════════════════╝
"""

import os
import time
import requests
import chromadb
import ollama
from typing import Dict, List, Any

# Configuración
DIRECTUS_URL = "https://admin.alvarezplacas.com.ar"
TOKEN = "alvarez-api-token-v16-2026"
CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "javiermix_docs"
EMBED_MODEL = "nomic-embed-text"

def get_headers():
    return {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }

def fetch_all_items(collection: str, fields: str = "*", limit: int = 100) -> List[Dict[str, Any]]:
    """Obtiene todos los elementos de una colección manejando paginación."""
    url = f"{DIRECTUS_URL}/items/{collection}"
    items = []
    offset = 0
    
    print(f"Descargando colección '{collection}'...")
    while True:
        params = {
            "fields": fields,
            "limit": limit,
            "offset": offset
        }
        resp = requests.get(url, headers=get_headers(), params=params, timeout=10)
        if resp.status_code != 200:
            print(f"Error cargando {collection}: {resp.status_code} - {resp.text}")
            break
            
        data = resp.json().get("data", [])
        if not data:
            break
            
        items.extend(data)
        offset += len(data)
        print(f"  -> Descargados {offset} elementos...")
        
        # Si descargamos menos del límite, ya terminamos
        if len(data) < limit:
            break
            
    print(f"[OK] Total '{collection}': {len(items)}")
    return items

def main():
    print("==========================================================")
    print(" INICIANDO INDEXACIÓN DE DIRECTUS (ALVAREZ PLACAS)         ")
    print("==========================================================")
    
    # 1. Obtener marcas y rubros para mapeo
    marcas = fetch_all_items("marcas", fields="id,nombre")
    rubros = fetch_all_items("Rubros", fields="id,nombre")
    
    marcas_map = {m["id"]: m["nombre"] for m in marcas}
    rubros_map = {r["id"]: r["nombre"] for r in rubros}
    
    # 2. Obtener todos los productos
    productos = fetch_all_items("Productos", fields="id,nombre,sku,marca,modelo,espesor,soporte,descripcion,linea,textura,precio_L1,precio_L2,Estado")
    
    if not productos:
        print("[Error] No se obtuvieron productos de Directus. Abortando.")
        return

    # 3. Conectar a ChromaDB local
    print(f"\nConectando a ChromaDB en '{CHROMA_PATH}'...")
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    print(f"Colección '{COLLECTION_NAME}' lista. Elementos actuales: {collection.count()}")

    # 4. Formatear, generar embeddings e indexar
    batch_size = 50
    ids_batch = []
    documents_batch = []
    metadatas_batch = []
    embeddings_batch = []
    
    total_products = len(productos)
    print(f"\nProcesando e indexando {total_products} productos en lotes de {batch_size}...")
    
    t0 = time.time()
    indexed_count = 0
    
    for idx, p in enumerate(productos):
        p_id = p.get("id")
        nombre = p.get("nombre") or ""
        sku = p.get("sku") or "Sin SKU"
        
        # Mapeos
        marca_id = p.get("marca")
        marca_nombre = marcas_map.get(marca_id, "Genérica") if marca_id else "Genérica"
        
        rubro_id = p.get("rubro")
        rubro_nombre = rubros_map.get(rubro_id, "General") if rubro_id else "General"
        
        modelo = p.get("modelo") or "N/A"
        espesor = p.get("espesor") or "N/A"
        soporte = p.get("soporte") or "N/A"
        linea = p.get("linea") or "N/A"
        textura = p.get("textura") or "N/A"
        
        # Precios
        precio_l1 = p.get("precio_L1")
        precio_l2 = p.get("precio_L2")
        precios_str = ""
        if precio_l1:
            precios_str += f"Precio Distribuidor (L1): ${precio_l1} | "
        if precio_l2:
            precios_str += f"Precio Público (L2): ${precio_l2}"
        if not precios_str:
            precios_str = "Precio a consultar"
            
        estado = ", ".join(p.get("Estado") or []) or "Sin estado"
        desc = p.get("descripcion") or nombre
        
        # Formatear el bloque de texto enriquecido para el RAG
        doc_text = (
            f"[Ficha de Producto - Alvarez Placas]\n"
            f"Nombre: {nombre}\n"
            f"SKU: {sku}\n"
            f"Marca: {marca_nombre}\n"
            f"Rubro/Categoría: {rubro_nombre}\n"
            f"Modelo: {modelo}\n"
            f"Espesor: {espesor} mm\n"
            f"Soporte: {soporte}\n"
            f"Línea: {linea}\n"
            f"Textura: {textura}\n"
            f"Precios: {precios_str}\n"
            f"Estado/Disponibilidad: {estado}\n"
            f"Descripción: {desc}\n"
        )
        
        doc_id = f"alvarez_prod_{p_id}"
        
        # Metadatos del vector
        metadata = {
            "source": "Directus Alvarez Placas",
            "type": "product",
            "product_id": str(p_id),
            "sku": sku,
            "brand": marca_nombre,
            "category": rubro_nombre
        }
        
        # Generar embedding local con Ollama
        try:
            resp = ollama.embeddings(model=EMBED_MODEL, prompt=doc_text)
            embedding = resp["embedding"]
            
            ids_batch.append(doc_id)
            documents_batch.append(doc_text)
            metadatas_batch.append(metadata)
            embeddings_batch.append(embedding)
            
        except Exception as e:
            print(f"Error generando embedding para producto {p_id} ({sku}): {e}")
            continue
            
        # Cuando el lote se completa, hacemos upsert
        if len(ids_batch) >= batch_size or idx == total_products - 1:
            try:
                collection.upsert(
                    ids=ids_batch,
                    embeddings=embeddings_batch,
                    documents=documents_batch,
                    metadatas=metadatas_batch
                )
                indexed_count += len(ids_batch)
                percent = round((idx + 1) / total_products * 100, 1)
                print(f"  [{percent}%] Indexados {indexed_count}/{total_products} productos...")
            except Exception as e:
                print(f"Error insertando lote en ChromaDB: {e}")
                
            # Limpiar lote
            ids_batch = []
            documents_batch = []
            metadatas_batch = []
            embeddings_batch = []
            
    total_time = round(time.time() - t0, 2)
    print("==========================================================")
    print(f"¡INDEXACIÓN COMPLETADA EXITOSAMENTE!")
    print(f"Productos indexados: {indexed_count}")
    print(f"Tiempo transcurrido: {total_time} segundos")
    print(f"Total de vectores en la base: {collection.count()}")
    print("==========================================================")

if __name__ == "__main__":
    main()
