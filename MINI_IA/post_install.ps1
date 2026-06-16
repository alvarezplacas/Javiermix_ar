#!/usr/bin/env pwsh
# ============================================================
# post_install.ps1 — Descarga modelos Ollama y verifica todo
# Ejecutar DESPUÉS de que Ollama esté instalado
# ============================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " POST-INSTALL: Descargando modelos Ollama  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que ollama está disponible
$ollamaCmd = Get-Command ollama -ErrorAction SilentlyContinue
if (!$ollamaCmd) {
    # Buscar en paths conocidos
    $paths = @(
        "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe",
        "C:\Program Files\Ollama\ollama.exe",
        "$env:ProgramFiles\Ollama\ollama.exe"
    )
    $found = $paths | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($found) {
        $env:PATH = "$([System.IO.Path]::GetDirectoryName($found));$env:PATH"
        Write-Host "[OK] Ollama encontrado en: $found" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Ollama no encontrado. Instalalo primero desde https://ollama.com" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] Ollama en PATH: $($ollamaCmd.Source)" -ForegroundColor Green
}

# 2. Arrancar Ollama si no está corriendo
Write-Host ""
Write-Host "[*] Verificando servicio Ollama..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 3
    Write-Host "[OK] Ollama ya está corriendo." -ForegroundColor Green
} catch {
    Write-Host "[*] Iniciando ollama serve..." -ForegroundColor Yellow
    Start-Process -FilePath "ollama" -ArgumentList "serve" -NoNewWindow
    Start-Sleep -Seconds 6
    Write-Host "[OK] Ollama iniciado." -ForegroundColor Green
}

# 3. Descargar modelo LLM
Write-Host ""
Write-Host "[*] Descargando llama3 (puede tardar 5-10 min en primera descarga)..." -ForegroundColor Yellow
ollama pull llama3
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] llama3 listo." -ForegroundColor Green
} else {
    Write-Host "[WARN] Error descargando llama3." -ForegroundColor Red
}

# 4. Descargar modelo de embeddings
Write-Host ""
Write-Host "[*] Descargando nomic-embed-text..." -ForegroundColor Yellow
ollama pull nomic-embed-text
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] nomic-embed-text listo." -ForegroundColor Green
} else {
    Write-Host "[WARN] Error descargando nomic-embed-text." -ForegroundColor Red
}

# 5. Verificar API FastAPI
Write-Host ""
Write-Host "[*] Verificando que main.py importa correctamente..." -ForegroundColor Yellow
$pythonExe = "C:\Users\javier\AppData\Local\Python\pythoncore-3.14-64\python.exe"
if (!(Test-Path $pythonExe)) { $pythonExe = "python" }

$testResult = & $pythonExe -c "import fastapi, uvicorn, chromadb, ollama, pdfplumber; print('OK')" 2>&1
if ($testResult -match "OK") {
    Write-Host "[OK] Todos los módulos Python disponibles." -ForegroundColor Green
} else {
    Write-Host "[ERROR] Falta algún módulo. Ejecutar: pip install fastapi uvicorn ollama chromadb pdfplumber" -ForegroundColor Red
}

# 6. Resumen final
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " SETUP COMPLETO - Cerebro Cognitivo Listo  " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host " Para iniciar la API, ejecuta:" -ForegroundColor White
Write-Host "   .\arrancar_ia.bat" -ForegroundColor Yellow
Write-Host ""
Write-Host " O directamente:" -ForegroundColor White
Write-Host "   $pythonExe main.py" -ForegroundColor Yellow
Write-Host ""
Write-Host " Endpoints disponibles en http://localhost:8000:" -ForegroundColor White
Write-Host "   GET  /api/chat/status    → Estado del sistema" -ForegroundColor Gray
Write-Host "   POST /api/chat/query     → Consulta RAG" -ForegroundColor Gray
Write-Host "   POST /api/documents/index-pdf → Subir PDF" -ForegroundColor Gray
Write-Host "   GET  /docs               → Swagger interactivo" -ForegroundColor Gray
Write-Host ""
