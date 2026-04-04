Write-Host "Conectando al servidor VPS para desplegar el nuevo motor..." -ForegroundColor Cyan
ssh root@144.217.163.13 "cd /home/ubuntu/prod/javiermix_web ; git pull origin main ; docker compose -f docs/vps_extras/docker-compose.prod.yml up -d --build web_javiermix"
Write-Host "Proceso de despliegue finalizado." -ForegroundColor Green
