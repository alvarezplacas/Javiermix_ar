@echo off
:: ==================================================
:: SERVIDOR COGNITIVO IA - JAVIERMIX (NODO 3 - i7)
:: ==================================================
title CEREBRO COGNITIVO IA - JAVIERMIX
cd /d "%~dp0"

echo.
echo  ================================================
echo   CEREBRO COGNITIVO IA - Nodo 3 (i7)
echo   FastAPI + Ollama + ChromaDB
echo  ================================================
echo.

:: Python path (ajustar si es necesario)
set PYTHON=C:\Users\javier\AppData\Local\Python\pythoncore-3.14-64\python.exe
if not exist "%PYTHON%" (
    set PYTHON=python
)

:: Verificar Ollama en puerto 11434
echo [*] Verificando Ollama en puerto 11434...
powershell -NoProfile -Command "try { (Invoke-WebRequest http://localhost:11434/api/tags -UseBasicParsing -TimeoutSec 2).StatusCode } catch { 0 }" > temp_check.txt 2>nul
set /p OLLAMA_STATUS=<temp_check.txt
del temp_check.txt 2>nul

if "%OLLAMA_STATUS%"=="200" (
    echo [OK] Ollama activo.
) else (
    echo [!] Ollama no detectado. Iniciando en segundo plano...
    start /min "" ollama serve
    echo [*] Esperando 6 segundos...
    timeout /t 6 /nobreak >nul
    echo [OK] Ollama lanzado.
)

echo.
echo [*] Iniciando servidor FastAPI RAG en puerto 8000...
echo [INFO] API disponible en: http://localhost:8000
echo [INFO] Docs Swagger en:   http://localhost:8000/docs
echo [INFO] Status:            http://localhost:8000/api/chat/status
echo.

"%PYTHON%" main.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] No se pudo iniciar el servidor FastAPI.
    echo Verificar: Python, dependencias (pip install fastapi uvicorn ollama chromadb pdfplumber)
    pause
)
