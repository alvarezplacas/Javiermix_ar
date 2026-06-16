# 📝 Instrucciones de Traspaso para Antigravity IA (Sesión Nocturna)
**Proyecto:** Cerebro Cognitivo e Integración de Procesos (Alvarez Placas)
**Nodo de Ejecución:** Nodo 3 (PC con procesador i7 - Servidor de Inteligencia)
**Fecha del Traspaso:** 12 de Junio de 2026 (Tarde -> Noche)

Hola, agente Antigravity de la noche. Este documento resume el trabajo realizado en la sesión de la tarde desde `MarketingPost` (Nodo 4) y detalla tu plan de ejecución paso a paso para desplegar y poner en marcha el Cerebro Cognitivo local (FastAPI, Ollama y ChromaDB) en esta PC i7 (Nodo 3).

---

## 1. 🔍 Estado Actual y Topología de Red
El ecosistema de Alvarez Placas opera en una red de malla privada **Tailscale Mesh VPN** (rango `100.x.y.z`). Los nodos activos son:
-   **Nodo 1 (VPS):** Contenedor público del local.
-   **Nodo 2 (Servidor i5 - `100.94.20.127` / `192.168.1.87`):** Aloja la base de datos PostgreSQL de producción (`alvarez_placas_db`), el escáner de cámaras y el nuevo **Visor Operativo 3010** (con un diseño premium estilo "Adobe Illustrator").
-   **Nodo 3 (Esta PC i7):** Destinado exclusivamente a correr Ollama y la API de RAG en Python (FastAPI).
-   **Nodo 4 (MarketingPost - `100.106.57.3`):** Estación de desarrollo local.

---

## 2. 📋 Plan de Ejecución Nocturna (Checklist para la IA)

Por favor, ejecuta las siguientes tareas en secuencia ordenada:

### 🟩 [Paso 1] Preparación del Entorno Local (i7)
1.  **Consola de PowerShell:** Abre una consola de PowerShell con privilegios de **Administrador**.
2.  **Ubicación del Script:** Navega al directorio del instalador en tu workspace:
    ```powershell
    cd "D:\Alvarezplacas_2026\WEB-alvarezplacas_astro\Alvarezplacas\IA_ASESOR\cerebro_cognitivo_n3\setup_i7"
    ```
3.  **Ejecutar Instalador Automatizado:** Corre el script para instalar dependencias Python, configurar Ollama de forma silenciosa y descargar los modelos:
    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
    .\setup_n3_i7.ps1
    ```
    *Nota:* El script descargará automáticamente los modelos **`llama3`** (LLM) y **`nomic-embed-text`** (Embeddings) locales.

### 🟩 [Paso 2] Lanzamiento de la API REST del Cerebro Cognitivo
1.  **Lanzamiento:** Ejecuta el lanzador rápido de lotes:
    ```powershell
    .\arrancar_ia.bat
    ```
    Este script iniciará Ollama en segundo plano (si no está activo) y levantará el servidor FastAPI (`main.py`) expuesto en el puerto **`8000`** en la red local.
2.  **Verificación de Estado:** Abre un navegador o usa `curl` para consultar:
    `http://localhost:8000/api/chat/status`
    El JSON retornado debe marcar tanto la API como Ollama en estado `"online"`.

### 🟩 [Paso 3] Indexación de los Manuales de Melamina y Carpintería (RAG)
Una vez activa la API en el puerto `8000`, debes poblar la base de datos vectorial ChromaDB indexando las guías técnicas locales.
1.  **Manuales a Indexar:** Se encuentran en la carpeta local:
    `D:\Alvarezplacas_2026\WEB-alvarezplacas_astro\Alvarezplacas\web01\Manuales_pdf\`
2.  **Ejecución del Indexador:** Corre el indexador en Python pasándole las rutas exactas. El indexador soporta `pdfplumber` (preinstalado en el entorno local) para extraer el texto de forma limpia.
    Ejecuta en consola:
    ```powershell
    # Indexar Manual Técnico de Melamina #01
    python ..\..\scripts_utilidades\pdf_indexer.py "D:\Alvarezplacas_2026\WEB-alvarezplacas_astro\Alvarezplacas\web01\Manuales_pdf\Manual Técnico de Melamina #01.pdf" --api http://localhost:8000
    
    # Indexar Manual Técnico de Melamina #02
    python ..\..\scripts_utilidades\pdf_indexer.py "D:\Alvarezplacas_2026\WEB-alvarezplacas_astro\Alvarezplacas\web01\Manuales_pdf\Manual Técnico de Melamina #02.pdf" --api http://localhost:8000
    
    # Indexar Manual de Construcción de Muebles
    python ..\..\scripts_utilidades\pdf_indexer.py "D:\Alvarezplacas_2026\WEB-alvarezplacas_astro\Alvarezplacas\web01\Manuales_pdf\Manual-para-Construir-Muebles-con-Melamina-ManualesPDF.Online.pdf" --api http://localhost:8000
    ```
3.  **Confirmación:** Asegúrate de que la API retorne código de éxito `201 Created` para cada fragmento de página indexado.

### 🟩 [Paso 4] Pruebas de Consulta RAG
Valida que la IA responde con precisión técnica basándose en los manuales indexados:
1.  **Ejecutar Cliente de Prueba:** Corre el script PowerShell de testeo rápido:
    ```powershell
    cd ..\..\scripts_utilidades
    .\test_client.ps1
    ```
2.  **Prueba Manual:** Envía un JSON POST al puerto 8000 con una pregunta como:
    *   *“¿Cuál es el distanciamiento recomendado para bisagras cazoleta en placas de melamina de 18mm?”*
    El RAG debe recuperar el contexto de los manuales indexados y dar una respuesta estructurada libre de alucinaciones.

---

## 3. ⚙️ Puertos y Credenciales de Red Local
-   **PostgreSQL (Nodo 2):** `100.94.20.127:5432` / db: `alvarez_placas_db` / user: `postgres` / pass: `AlvarezAdmin2026`.
-   **FastAPI RAG API (Nodo 3 - Local):** `http://localhost:8000` o `http://100.x.x.I7:8000` en Tailscale.
-   **Ollama local (Nodo 3):** `http://localhost:11434`.
-   **Visor Operativo (Nodo 2):** `http://100.94.20.127:3010` (Visor gráfico de red de cámaras y Gecom FoxPro).

¡Buen desarrollo nocturno! Deja un resumen de tus avances en este mismo directorio al finalizar tu turno.
