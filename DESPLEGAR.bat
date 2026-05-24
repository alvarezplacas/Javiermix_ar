@echo off
:: ==========================================================================
:: JMX DEPLOY SHORTCUT
:: Double-click to deploy from Windows Explorer!
:: ==========================================================================
title JMX Deploy Master v3.0
d:
cd d:\web_javiermix\JAVIERMIX-AR-0504
powershell -NoProfile -ExecutionPolicy Bypass -File .\DESPLEGAR.ps1
echo.
echo ==========================================================================
echo Presione cualquier tecla para salir...
pause > nul
