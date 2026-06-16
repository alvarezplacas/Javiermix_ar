import os
import glob
import base64
import asyncio
import aiohttp
from fpdf import FPDF
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
log = logging.getLogger("ocr_pipeline")

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL_VISION = os.getenv("OLLAMA_MODEL_VISION", "llama3.2-vision:11b")

# Rutas de carpetas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INBOX_DIR = os.path.join(BASE_DIR, "onevision_scanner")
OUTBOX_DIR = os.path.join(BASE_DIR, "libros_procesados")

class PDFBuilder(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.cell(0, 10, f"Página {self.page_no()}", align="C")

async def extract_text_from_image(session: aiohttp.ClientSession, image_path: str) -> str:
    """Extrae texto de una imagen usando Llama 3.2 Vision."""
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")
        
    prompt = "Extrae todo el texto legible de esta página de libro. Mantén los párrafos y saltos de línea. Responde EXCLUSIVAMENTE con el texto extraído, sin comentarios adicionales ni markdown de bloques."
    
    payload = {
        "model": MODEL_VISION,
        "prompt": prompt,
        "images": [img_b64],
        "stream": False
    }
    
    log.info(f"Procesando imagen: {os.path.basename(image_path)}")
    try:
        async with session.post(f"{OLLAMA_HOST}/api/generate", json=payload, timeout=aiohttp.ClientTimeout(total=300)) as response:
            response.raise_for_status()
            data = await response.json()
            return data.get("response", "").strip()
    except Exception as e:
        log.error(f"Error procesando {image_path}: {e}")
        return f"[Error al extraer texto de {os.path.basename(image_path)}]"

async def generate_ebook_task(title: str):
    """Tarea principal para leer imágenes, extraer texto y generar PDF."""
    if not os.path.exists(INBOX_DIR):
        os.makedirs(INBOX_DIR)
    
    # Encontrar todas las imágenes (jpg, png)
    extensions = ["*.jpg", "*.jpeg", "*.png"]
    images = []
    for ext in extensions:
        images.extend(glob.glob(os.path.join(INBOX_DIR, ext)))
        images.extend(glob.glob(os.path.join(INBOX_DIR, ext.upper())))
        
    # Ordenarlas para mantener la secuencia de páginas
    images.sort()
    
    if not images:
        log.warning("No hay imágenes en el buzón para procesar.")
        return
        
    log.info(f"Comenzando OCR para el libro: '{title}'. Total de páginas detectadas: {len(images)}")
    
    extracted_pages = []
    async with aiohttp.ClientSession() as session:
        for img_path in images:
            text = await extract_text_from_image(session, img_path)
            extracted_pages.append(text)
            
    # 2. Generar PDF
    log.info("Maquetando PDF...")
    # Crear la carpeta de destino para el libro
    book_dir = os.path.join(OUTBOX_DIR, title.replace(" ", "_"))
    if not os.path.exists(book_dir):
        os.makedirs(book_dir)
        
    pdf = PDFBuilder()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("helvetica", size=12) # Se usa Helvetica por defecto si no se descargó Montserrat
    
    # Agregar un título al inicio
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, title, align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)
    pdf.set_font("helvetica", size=12)
    
    for i, page_text in enumerate(extracted_pages):
        # Tratar caracteres Unicode que no estén en latin-1 (FPDF básico usa latin-1)
        # La solución es reemplazar o usar utf-8 support font (TTF).
        safe_text = page_text.encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 8, safe_text, align="J")
        # Forzar salto de página a menos que sea la última
        if i < len(extracted_pages) - 1:
            pdf.add_page()
            
    output_pdf = os.path.join(book_dir, f"{title.replace(' ', '_')}.pdf")
    pdf.output(output_pdf)
    log.info(f"PDF generado exitosamente en: {output_pdf}")
    
    # 3. Limpieza de imágenes (Inbox)
    for img_path in images:
        try:
            os.remove(img_path)
            log.info(f"Imagen original borrada: {img_path}")
        except OSError as e:
            log.error(f"Error borrando {img_path}: {e}")

    log.info("Proceso de Generación de Libro finalizado.")
