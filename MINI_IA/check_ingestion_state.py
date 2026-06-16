import chromadb
from collections import Counter
import requests

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "javiermix_docs"

def main():
    print("--- ANÁLISIS DE ESTADO DE INGESTA (MINI IA) ---")
    
    # 1. Analizar ChromaDB
    try:
        chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        collection = chroma_client.get_collection(name=COLLECTION_NAME)
        total_vectors = collection.count()
        print(f"\n[ChromaDB] Total de vectores indexados: {total_vectors}")
        
        # Obtener todos los metadatos
        result = collection.get(include=['metadatas'])
        metadatas = result['metadatas']
        
        # Contadores
        types = Counter()
        sources = Counter()
        manuals = Counter()
        
        for m in metadatas:
            if m:
                types[m.get('type', 'Unknown')] += 1
                sources[m.get('source', 'Unknown')] += 1
                if m.get('type') == 'manual':
                    manuals[m.get('filename', 'Unknown')] += 1
                    
        print("\nDesglose por Tipo de Dato:")
        for k, v in types.items():
            print(f" - {k}: {v} vectores")
            
        print("\nDesglose por Origen (Source):")
        for k, v in sources.items():
            print(f" - {k}: {v} vectores")
            
        print(f"\nManuales Indexados ({len(manuals)} archivos diferentes):")
        for k, v in manuals.most_common(5):
            print(f" - {k}: {v} fragmentos")
        if len(manuals) > 5:
            print(f" - ... y {len(manuals) - 5} manuales más.")
            
    except Exception as e:
        print(f"Error conectando a ChromaDB: {e}")

    # 2. Analizar Directus (Productos)
    try:
        url = "https://admin.alvarezplacas.com.ar/items/Productos"
        headers = {"Authorization": "Bearer alvarez-api-token-v16-2026"}
        resp = requests.get(url, headers=headers, params={"aggregate[count]": "*"})
        
        if resp.status_code == 200:
            data = resp.json().get("data", [])
            if data:
                total_directus = data[0].get("count")
                print(f"\n[Directus] Total de productos en la base de datos principal: {total_directus}")
                
                # Comparativa
                prod_vectores = types.get('product', 0)
                try:
                    total_directus = int(total_directus)
                    if prod_vectores == total_directus:
                        print("✅ Sincronización PERFECTA: Todos los productos están indexados.")
                    elif prod_vectores < total_directus:
                        print(f"⚠️ Faltan indexar {total_directus - prod_vectores} productos. (Se recomienda correr directus_indexer.py)")
                    else:
                        print("ℹ️ Hay más vectores de producto que productos actuales (posiblemente productos eliminados que siguen en caché).")
                except ValueError:
                    pass
        else:
            print(f"\n[Directus] Error al conectar: {resp.status_code}")
    except Exception as e:
        print(f"\n[Directus] Error al conectar: {e}")

if __name__ == "__main__":
    main()
