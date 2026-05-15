# JMX AUTO-DEPLOY MASTER
Clear-Host
Write-Host "JAVIERMIX - DESPLIEGUE AUTOMATICO" -ForegroundColor Cyan
git add .
git commit -m "Auto-deploy: Redesign Menu"
git push origin master
Write-Host "CLAVE SSH: Tecno/121212" -ForegroundColor Red
ssh root@144.217.163.13 "cd /opt/javiermix/web_0504/ ; git fetch origin ; git reset --hard origin/master ; docker compose up -d --build web_javiermix"
Write-Host "LISTO" -ForegroundColor Green
