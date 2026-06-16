#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
╔══════════════════════════════════════════════════════════════════╗
║   PIPELINE ASÍNCRONO DE PROCESAMIENTO DE IMÁGENES — MINI IA      ║
║   Inferencia: Ollama + DeepFace | Almacenamiento: VPS (Qdrant)   ║
╚══════════════════════════════════════════════════════════════════╝
"""

import os
import io
import json
import base64
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
from deepface import DeepFace
from PIL import Image

# Cargar variables de entorno
load_dotenv()

# ================= CONFIGURACIÓN =================
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2-vision:11b")
TAILSCALE_VPS_IP = os.getenv("TAILSCALE_VPS_IP", "144.217.163.13")
VPS_API_URL = os.getenv("VPS_API_URL", f"http://{TAILSCALE_VPS_IP}:8000") # Asumiendo API REST
QDRANT_URL = os.getenv("QDRANT_URL", f"http://{TAILSCALE_VPS_IP}:6333")
MAX_CONCURRENCY = int(os.getenv("MAX_CONCURRENCY", "4"))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "10"))

# Pool de hilos para operaciones bloqueantes (DeepFace, PIL, I/O síncrono)
executor = ThreadPoolExecutor(max_workers=MAX_CONCURRENCY)

class ImageProcessorPipeline:
    def __init__(self):
        self.collection_name = "vision_metadata"
        # Inicializar cliente asíncrono de Qdrant (descomentar si se usa Qdrant)
        # from qdrant_client import AsyncQdrantClient
        # self.qdrant = AsyncQdrantClient(url=QDRANT_URL)

    def _resize_and_encode(self, image_bytes: bytes) -> str:
        """
        Redimensiona la imagen y la convierte a Base64 de forma eficiente.
        Se ejecuta en el ThreadPool para no bloquear el Event Loop.
        """
        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                # Redimensionar para no saturar RAM ni VRAM de Ollama
                img.thumbnail((1024, 1024))
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                buffer = io.BytesIO()
                img.save(buffer, format="JPEG", quality=85)
                return base64.b64encode(buffer.getvalue()).decode('utf-8')
        except Exception as e:
            raise RuntimeError(f"Error procesando imagen con PIL: {e}")

    def _detect_faces_sync(self, image_bytes: bytes) -> dict:
        """
        Detección facial con DeepFace. Función sincrónica intensiva en CPU.
        """
        try:
            import numpy as np
            import cv2
            # DeepFace requiere un array de numpy o una ruta local. Convertimos bytes a CV2.
            np_arr = np.frombuffer(image_bytes, np.uint8)
            img_cv2 = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            results = DeepFace.extract_faces(img_path=img_cv2, enforce_detection=False)
            faces = [res for res in results if res.get('confidence', 0) > 0.8]
            return {"faces_detected": len(faces) > 0, "face_count": len(faces)}
        except Exception as e:
            return {"faces_detected": False, "error": str(e)}

    async def _analyze_with_ollama(self, session: aiohttp.ClientSession, base64_image: str) -> dict:
        """
        Consulta asíncrona a la API REST de Ollama forzando salida JSON.
        """
        prompt = '''Analiza esta imagen y devuelve EXCLUSIVAMENTE un objeto JSON válido con esta estructura exacta, sin markdown ni explicaciones adicionales:
{
  "estilo_fotografico": "",
  "iluminacion_y_plano": "",
  "objetos_detectados": [],
  "contexto_urbano_o_arquitectonico": ""
}'''
        
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "images": [base64_image],
            "stream": False,
            "format": "json" # Ollama soporta modo JSON nativo
        }
        
        try:
            async with session.post(f"{OLLAMA_HOST}/api/generate", json=payload, timeout=aiohttp.ClientTimeout(total=180)) as response:
                response.raise_for_status()
                data = await response.json()
                response_text = data.get("response", "{}")
                try:
                    return json.loads(response_text)
                except json.JSONDecodeError:
                    return {"error": "Ollama devolvió un JSON inválido", "raw": response_text}
        except asyncio.TimeoutError:
            return {"error": "Timeout en Ollama"}
        except Exception as e:
            return {"error": f"Error de red con Ollama: {str(e)}"}

    async def fetch_image_from_vps(self, session: aiohttp.ClientSession, image_id: str) -> bytes:
        """
        Descarga asíncrona de la imagen desde una API en el VPS (Tailscale IP).
        Si usas SFTP puro, esto requeriría paramiko dentro de run_in_executor o asyncssh.
        """
        try:
            async with session.get(f"{VPS_API_URL}/api/images/{image_id}") as response:
                if response.status == 200:
                    return await response.read()
                return None
        except Exception as e:
            print(f"[!] Error descargando imagen {image_id}: {e}")
            return None

    async def process_single_image(self, session: aiohttp.ClientSession, image_id: str):
        print(f"[*] Iniciando procesamiento de: {image_id}")
        
        # 1. Obtener imagen del VPS
        image_bytes = await self.fetch_image_from_vps(session, image_id)
        if not image_bytes:
            print(f"[!] Saltando {image_id}: No se pudo descargar o imagen corrupta.")
            return None

        loop = asyncio.get_running_loop()
        
        try:
            # 2. Redimensionar y encodear (en ThreadPool para no bloquear)
            b64_img = await loop.run_in_executor(executor, self._resize_and_encode, image_bytes)
            
            # 3. Ejecutar DeepFace y Ollama en PARALELO
            face_task = loop.run_in_executor(executor, self._detect_faces_sync, image_bytes)
            vision_task = self._analyze_with_ollama(session, b64_img)
            
            # Esperar ambos resultados simultáneamente
            face_result, vision_result = await asyncio.gather(face_task, vision_task)
            
            metadata = {
                "image_id": image_id,
                "facial_data": face_result,
                "semantic_data": vision_result
            }
            return metadata
            
        except Exception as e:
            print(f"[!] Error procesando {image_id}: {e}")
            return None

    async def export_results(self, results: list):
        """
        Exporta resultados consolidados a un JSON local unificado.
        """
        if not results:
            return
            
        output_file = "consolidated_vision_metadata.json"
        
        try:
            existing_data = []
            if os.path.exists(output_file):
                with open(output_file, "r", encoding="utf-8") as f:
                    existing_data = json.load(f)
            
            existing_data.extend(results)
            
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(existing_data, f, indent=4, ensure_ascii=False)
                
            print(f"[+] Exportados {len(results)} registros a {output_file}")
        except Exception as e:
            print(f"[!] Error exportando resultados: {e}")

async def main():
    pipeline = ImageProcessorPipeline()
    
    # Mock: Lista de imágenes a procesar provenientes del VPS
    vps_images = ["img_torino_01.jpg", "img_arquitectura_02.jpg"]
    
    # Manejar sesión HTTP global asíncrona
    async with aiohttp.ClientSession() as session:
        for i in range(0, len(vps_images), BATCH_SIZE):
            batch = vps_images[i:i + BATCH_SIZE]
            print(f"\n--- Procesando Lote {i//BATCH_SIZE + 1} ---")
            
            tasks = [pipeline.process_single_image(session, img_id) for img_id in batch]
            results = await asyncio.gather(*tasks)
            
            # Filtrar fallos
            valid_results = [r for r in results if r is not None]
            await pipeline.export_results(valid_results)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[!] Procesamiento interrumpido por el usuario.")
