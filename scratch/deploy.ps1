$wshell = New-Object -ComObject WScript.Shell
$path = "c:\Users\javier\Desktop\JMX_DEPLOY_MASTER\SUBIR_Y_ACTUALIZAR.bat"
Write-Host "Iniciando despliegue..."
Start-Process cmd.exe -ArgumentList "/c", $path
Write-Host "Esperando prompt de password..."
Start-Sleep -Seconds 8
$wshell.SendKeys("Tecno/121212{ENTER}")
Write-Host "Password enviado."
