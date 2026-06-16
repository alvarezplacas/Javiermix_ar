import chromadb
import ollama

def main():
    CHROMA_PATH = "./chroma_db"
    COLLECTION_NAME = "javiermix_docs"
    
    print("Conectando a ChromaDB...")
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = chroma_client.get_collection(name=COLLECTION_NAME)
    
    query = "¿Qué dice el manual de colores sobre combinaciones?"
    print(f"Pregunta: {query}")
    
    # Generar embedding de la pregunta
    resp = ollama.embeddings(model="nomic-embed-text", prompt=query)
    q_embed = resp["embedding"]
    
    # Consultar
    results = collection.query(
        query_embeddings=[q_embed],
        n_results=3
    )
    
    print("\nResultados encontrados:")
    for i in range(len(results['documents'][0])):
        doc = results['documents'][0][i]
        meta = results['metadatas'][0][i]
        dist = results['distances'][0][i]
        print(f"\n--- Resultado {i+1} (Distancia: {dist:.4f}) ---")
        print(f"Metadata: {meta}")
        print(f"Texto: {doc[:300]}...")

if __name__ == "__main__":
    main()
