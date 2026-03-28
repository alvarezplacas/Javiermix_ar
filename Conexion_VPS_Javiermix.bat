@echo off
title Conexion SSH VPS Javiermix
color 0b

echo ==============================================
echo =                                            =
echo =   CONECTANDO AL SERVIDOR VPS JAVIER MIX    =
echo =                                            =
echo ==============================================
echo.
echo Presiona enter si te pide la password...
echo.

ssh -o ServerAliveInterval=60 root@144.217.163.13

echo.
echo ==============================================
echo =   DESCONECTADO DEL SERVIDOR VPS            =
echo ==============================================
pause
