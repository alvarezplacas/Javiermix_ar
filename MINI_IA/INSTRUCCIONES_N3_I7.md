# Guía de Instalación y Configuración del Cerebro Cognitivo (Nodo 3 - i7)
**Proyecto:** Ecosistema Escalable Alvarez Placas & Javiermix
**Dispositivo Destino:** Servidor de Inteligencia i7 (On-Premise)

Este documento detalla el procedimiento para configurar la PC con procesador i7 desde cero como el **Nodo 3 (Cerebro Cognitivo)** del ecosistema de IA, alojando los modelos de lenguaje (LLMs), embeddings, base vectorial ChromaDB y la API FastAPI.

---

## 📋 Requisitos Previos

1. **Sistema Operativo:** Windows 10/11 Pro o Enterprise (64 bits).
2. **Conexión de Red:** Conectado a la LAN y registrado en la VPN de Tailscale con una IP virtual fija.
3. **Privilegios:** Cuenta con permisos de Administrador para instalar servicios y aplicaciones globales.

---

## 🛠️ Procedimiento de Instalación Rápida (Semiautomatizado)

Para simplificar el despliegue, se ha diseñado un script en PowerShell (`setup_n3_i7.ps1`) que realiza las siguientes acciones automáticamente:
- Verifica e instala las dependencias de Python.
- Descarga e instala **Ollama** de forma silenciosa.
- Inicializa el servicio de Ollama y descarga los modelos requeridos (`llama3` y `nomic-embed-text`).
- Registra el servidor FastAPI en PM2 (o crea un lanzador de inicio en Windows).

### Pasos para Ejecutar:
1. Abre una consola de **PowerShell como Administrador**.
2. Navega hasta esta carpeta de instalación:
   ```powershell
   cd "D:\Alvarezplacas_2026\WEB-alvarezplacas_astro\Alvarezplacas\IA_ASESOR\cerebro_cognitivo_n3\setup_i7"
   ```
3. Habilita la ejecución de scripts (si no lo está):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
   ```
4. Ejecuta el script de instalación:
   ```powershell
   .\setup_n3_i7.ps1
   ```

---

## ⚙️ Componentes Instalados y Configuración

### 1. Modelos en Ollama
El motor RAG de Alvarez Placas está configurado para consumir dos modelos locales:
*   **Modelo de Inferencia (LLM):** `llama3` (Para formular respuestas contextuales).
*   **Modelo de Representación (Embeddings):** `nomic-embed-text` (Para vectorizar fichas técnicas e históricos de chats).

### 2. Base Vectorial ChromaDB
*   **Base de datos:** ChromaDB persistente en disco. Los vectores se guardarán por defecto en la carpeta local `./chroma_db` dentro de `cerebro_cognitivo_n3`.

### 3. API REST FastAPI (Puerto 8000)
El servidor FastAPI expone los endpoints en el puerto `8000`. Al arrancar en la red Tailscale del i7, estará disponible para:
*   **Inferencia del Chat:** `POST http://100.x.x.I7:8000/api/chat/query`
*   **Indexación de Documentos:** `POST http://100.x.x.I7:8000/api/documents/index`
*   **Estado del Nodo:** `GET http://100.x.x.I7:8000/api/chat/status`

---

## 🚀 Arranque y Mantenimiento

### Opción A: Ejecución con PM2 (Recomendado si tiene Node.js)
Si la máquina i7 tiene Node.js instalado, puedes usar PM2 para mantener la API siempre activa en segundo plano:
1. Instalar PM2 globalmente (si no está):
   ```bash
   npm install -g pm2 pm2-windows-startup
   pm2-startup install
   ```
2. Iniciar la API de IA:
   ```bash
   pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name "AlvarezCognitivoIA" --cwd "C:\IA_AlvarezPlacas\cerebro_cognitivo_n3"
   pm2 save
   ```

### Opción B: Arranque Directo por Lote (Lanzador)
Ejecutar el archivo **`arrancar_ia.bat`** (incluido en esta carpeta). Este abrirá una ventana de consola y ejecutará el servidor en tiempo real. Puedes crear un acceso directo de este archivo y colocarlo en la carpeta de inicio de Windows (`shell:startup`) para que se ejecute al iniciar sesión.

---

## 🔍 Verificación del Estado
Una vez instalados los servicios, puedes verificar su correcto funcionamiento abriendo tu navegador e ingresando a:
*   `http://localhost:8000/docs` (Para ver la documentación interactiva Swagger de la API).
*   `http://localhost:8000/api/chat/status` (Para verificar la conexión FastAPI -> Ollama).
