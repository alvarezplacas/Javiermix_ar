# ==========================================================================
# JMX DEPLOY MASTER v3.3 - ESTANDAR DE ORO JAVIERMIX
# ==========================================================================
Clear-Host

# Logotipo Moderno y Seguro en Consola
Write-Host " ==========================================================================" -ForegroundColor Yellow
Write-Host "        JJJJJ  M   M  X   X      D   D  EEEEE  PPPP   L      OOO  Y   Y" -ForegroundColor Yellow
Write-Host "          J    MM MM   X X       D   D  E      P   P  L     O   O  Y Y " -ForegroundColor Yellow
Write-Host "          J    M M M    X        D   D  EEEE   PPPP   L     O   O   Y  " -ForegroundColor Yellow
Write-Host "      J   J    M   M   X X       D   D  E      P      L     O   O   Y  " -ForegroundColor Yellow
Write-Host "       JJJ     M   M  X   X      DDDD   EEEEE  P      LLLLL  OOO    Y  " -ForegroundColor Yellow
Write-Host " ==========================================================================" -ForegroundColor Yellow
Write-Host "                    SISTEMA DE DESPLIEGUE ULTRA-AUTOMATICO                  " -ForegroundColor Yellow
Write-Host " ==========================================================================" -ForegroundColor Yellow
Write-Host ""

# 1. Gestion de Commit No Bloqueante (Cuenta Atras de 3 Segundos)
Write-Host "Paso 1: Configurando control de versiones local..." -ForegroundColor Cyan
Write-Host "Presiona cualquier tecla si deseas escribir un mensaje personalizado..." -ForegroundColor Gray

$commitMsg = ""
$timeout = 3
$keyPressed = $false

try {
    while ($timeout -gt 0) {
        Write-Host -NoNewline "`rIniciando automatico en $timeout segundos... " -ForegroundColor Yellow
        if ([System.Console]::KeyAvailable) {
            $key = [System.Console]::ReadKey($true)
            $keyPressed = $true
            break
        }
        Start-Sleep -Milliseconds 1000
        $timeout--
    }
} catch {
    # Fallback si no es una consola interactiva standard
}
Write-Host "" # Limpiar linea de cuenta atras

if ($keyPressed) {
    Write-Host ""
    $commitMsg = Read-Host "Escribe tu mensaje de commit"
}

if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $currentTime = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMsg = "Auto-deploy: Actualizacion del $currentTime"
    Write-Host "Commit automatico: '$commitMsg'" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Anadiendo cambios a Git..." -ForegroundColor Gray
git add .
Write-Host "Creando commit..." -ForegroundColor Gray
git commit -m $commitMsg

Write-Host "Subiendo cambios a GitHub..." -ForegroundColor Gray
git push origin master
Write-Host "Cambios subidos correctamente al repositorio central." -ForegroundColor Green
Write-Host ""

# 2. Autodeteccion de Canal de Red (Tailscale vs Publica)
Write-Host "Paso 2: Escaneando rutas de red al VPS..." -ForegroundColor Cyan
$vpsTailscale = "100.127.6.20"
$vpsPublic = "144.217.163.13"
$targetIP = ""

if (Test-Connection -ComputerName $vpsTailscale -Count 1 -Quiet) {
    Write-Host "[Canal Seguro] Red Privada Tailscale activa." -ForegroundColor Green
    $targetIP = $vpsTailscale
} else {
    Write-Host "[Canal Publico] Tailscale no responde. Conmutando a IP Publica..." -ForegroundColor Magenta
    $targetIP = $vpsPublic
}
Write-Host "VPS IP de Destino: $targetIP" -ForegroundColor Gray
Write-Host ""

# 3. Verificacion de Autenticacion Rapida (One-Click Setup)
Write-Host "Paso 3: Validando autenticacion segura..." -ForegroundColor Cyan
$sshCheck = ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -o BatchMode=yes root@$targetIP "echo 'OK'" 2>$null
if ($sshCheck -ne "OK") {
    Write-Host "Acceso automatizado no configurado aun en este canal." -ForegroundColor Yellow
    Write-Host "Vamos a instalar tu clave publica local en el VPS de forma automatizada." -ForegroundColor Yellow
    Write-Host "Por favor, escribe la contrasena del VPS ('Tecno/121212') cuando te la solicite la terminal:" -ForegroundColor Red
    Write-Host ""
    
    $pubKeyPath = "$env:USERPROFILE\.ssh\id_rsa.pub"
    if (Test-Path $pubKeyPath) {
        $pubKey = Get-Content -Raw $pubKeyPath
        ssh -o StrictHostKeyChecking=no root@$targetIP "mkdir -p ~/.ssh && echo '$pubKey' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
        
        $sshCheckSecond = ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -o BatchMode=yes root@$targetIP "echo 'OK'" 2>$null
        if ($sshCheckSecond -eq "OK") {
            Write-Host "Acceso sin contrasena configurado con exito! Despliegues Un-Clic activos." -ForegroundColor Green
        }
    } else {
        Write-Host "ERROR: No se encontro una clave SSH publica local en '$pubKeyPath'." -ForegroundColor Red
        Write-Host "Genera una en tu consola ejecutando: ssh-keygen -t rsa -b 4096" -ForegroundColor Yellow
    }
} else {
    Write-Host "[Perfecto] Llaves SSH autorizadas. Despliegue directo activo." -ForegroundColor Green
}
Write-Host ""

# 4. Despliegue Remoto en el VPS
Write-Host "Paso 4: Ordenando compilacion y reinicio en el VPS..." -ForegroundColor Cyan
$remoteCommand = "cd /opt/javiermix/web_0504/ ; git fetch origin ; git reset --hard origin/master ; docker compose up -d --build"

Write-Host "Construyendo imagen de Astro en contenedor Docker..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@$targetIP $remoteCommand

# 5. Finalizacion
Write-Host ""
Write-Host " ==========================================================================" -ForegroundColor Yellow
Write-Host "   DESPLIEGUE FINALIZADO CON EXITO!" -ForegroundColor Green
Write-Host "   Sitio web actualizado sobre: $targetIP" -ForegroundColor Cyan
Write-Host "   Estandar de Oro JMX aplicado." -ForegroundColor Yellow
Write-Host " ==========================================================================" -ForegroundColor Yellow
Write-Host ""
