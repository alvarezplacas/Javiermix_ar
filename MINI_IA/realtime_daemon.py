#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
╔══════════════════════════════════════════════════════════════════╗
║   ORQUESTADOR DE INGESTA EN TIEMPO REAL — MINI IA                ║
║   Alvarez Placas                                                 ║
╚══════════════════════════════════════════════════════════════════╝
"""

import time
import datetime
import subprocess

INTERVALO_SEGUNDOS = 300  # 5 minutos

def is_working_hours():
    """Retorna True si estamos dentro del horario laboral de Alvarez Placas."""
    now = datetime.datetime.now()
    weekday = now.weekday()  # Lunes = 0, Domingo = 6
    hour = now.hour
    
    if weekday <= 4:  # Lunes a Viernes
        return 8 <= hour < 18
    elif weekday == 5:  # Sábados
        return 8 <= hour < 14
    else:  # Domingos
        return False

def run_script(script_name):
    print(f"[{time.strftime('%H:%M:%S')}] Ejecutando {script_name}...")
    try:
        process = subprocess.Popen(
            ["python", script_name],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        for line in process.stdout:
            print("  |", line.strip())
        process.wait()
        print(f"[{time.strftime('%H:%M:%S')}] {script_name} finalizado.")
    except Exception as e:
        print(f"[!] Error ejecutando {script_name}: {e}")

def main():
    print("==========================================================")
    print(" VIGILANTE DE INGESTA EN TIEMPO REAL (DAEMON) INICIADO    ")
    print(f" Ciclo: cada {INTERVALO_SEGUNDOS / 60} minutos.")
    print(" Horario Laboral: Lun-Vie (08-18hs) | Sab (08-14hs)")
    print(" Presiona Ctrl+C para detener.")
    print("==========================================================")
    
    # IMPORTANTE: Forzamos un ciclo al iniciar, sin importar la hora, 
    # para que la IA asimile el estado actual al encenderla, como pidió el usuario ("ahora esta bien que entre en contexto")
    first_run = True

    while True:
        try:
            if not is_working_hours() and not first_run:
                print(f"[{time.strftime('%H:%M:%S')}] Fuera de horario laboral (Cerrado). Durmiendo...")
                time.sleep(INTERVALO_SEGUNDOS)
                continue
            
            first_run = False
            print(f"\n--- INICIANDO CICLO DE INGESTA: {time.strftime('%Y-%m-%d %H:%M:%S')} ---")
            
            # 1. Producción en vivo
            run_script("api_ventas_indexer.py")
            
            # 2. Facturas del VPS
            run_script("vps_facturas_indexer.py")
            
            print(f"--- CICLO TERMINADO. DURMIENDO {INTERVALO_SEGUNDOS / 60} MINUTOS ---")
            time.sleep(INTERVALO_SEGUNDOS)
            
        except KeyboardInterrupt:
            print("\nOrquestador detenido manualmente.")
            break
        except Exception as e:
            print(f"\n[!] Error crítico en el ciclo: {e}")
            time.sleep(60)

if __name__ == "__main__":
    main()
