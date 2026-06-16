# 🌐 Información del Sistema y Órdenes para Antigravity (Nodo Remoto)

Este documento contiene los detalles técnicos del **Cerebro Cognitivo (Nodo 3 - i7)** y las instrucciones para el agente Antigravity que se ejecute en otros nodos de la red (ej. `MarketingPost` o `server-alvarezplacas`).

---

## 1. ⚙️ Información del Servidor (i7 - dgmix)
El servidor de Inteligencia Artificial local está activo y configurado con los siguientes parámetros:

* **Nombre del Host**: `dgmix`
* **IP de Tailscale**: `100.110.176.23`
* **API REST (FastAPI)**: `http://100.110.176.23:8000`
  * *Swagger Docs*: `http://100.110.176.23:8000/docs`
  * *Status Endpoint*: `http://100.110.176.23:8000/api/chat/status`
* **Ollama Local**: `http://localhost:11434`
  * *Modelo LLM*: `llama3:latest`
  * *Modelo Embeddings*: `nomic-embed-text:latest`
* **Base de Datos Vectorial**: ChromaDB persistente en `./chroma_db`.
  * *Colección*: `javiermix_docs`
  * *Documentos Indexados*: **1,300 productos** (fichas técnicas completas de Alvarez Placas).

---

## 2. 📋 Instrucciones y Órdenes para Antigravity en los otros Nodos
Si eres el agente Antigravity ejecutándote en `MarketingPost` (`100.106.57.3`), `server-alvarezplacas` (`100.94.20.127`), o cualquier otro nodo de la red Tailscale, sigue estas directrices para integrarte con el Cerebro Cognitivo:

### 🔹 Consumir Inferencia RAG (Búsqueda Semántica)
Cuando el usuario o la aplicación web requieran realizar consultas inteligentes sobre stock, precios, marcas, modelos o fichas técnicas de Alvarez Placas:
1. **No levantes un Ollama local** ni vuelvas a crear una base de datos vectorial en tu nodo.
2. Realiza peticiones POST directamente al nodo de inferencia central:
   ```http
   POST http://100.110.176.23:8000/api/chat/query
   Content-Type: application/json

   {
     "question": "¿Cuál es el precio y stock de las placas EGGER Blanco Laca de 18mm?",
     "top_k": 4
   }
   ```
3. El RAG en el i7 procesará la pregunta, extraerá el contexto de los 1,300 productos y devolverá la respuesta técnica formateada.

### 🔹 Indexar Nuevos Documentos (PDF o Texto)
Si el usuario te solicita indexar manuales técnicos (por ejemplo, los de melamina), guías o catálogos:
1. **Indexación de PDFs**: Sube el archivo directamente al i7 usando el endpoint multipart:
   ```http
   POST http://100.110.176.23:8000/api/documents/index-pdf
   ```
2. **Indexación de texto plano**: Envía los bloques de texto mediante:
   ```http
   POST http://100.110.176.23:8000/api/documents/index
   ```

### 🔹 Configuración en el Código del Frontend (Astro / Next.js)
Asegúrate de que cualquier archivo de variables de entorno (`.env`) en los otros nodos apunte al Cerebro Cognitivo en la IP de Tailscale correspondiente:
```env
PUBLIC_COGNITIVE_IA_URL=http://100.110.176.23:8000
```
