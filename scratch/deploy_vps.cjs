const { spawn } = require('child_process');

console.log("🛰️ Iniciando conexión SSH con root@144.217.163.13...");

// Comando para actualizar y reconstruir el contenedor
const remoteCommand = 'cd /opt/javiermix/web_0504/ && git fetch origin && git reset --hard origin/master && docker compose up -d --build web_javiermix';

const child = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'PreferredAuthentications=password',
    '-tt', // Forzar asignación de pseudo-terminal para que pida clave de forma estándar
    'root@144.217.163.13',
    remoteCommand
], { 
    stdio: ['pipe', 'inherit', 'inherit'] 
});

// Esperar 4 segundos a que pida la clave y enviarla
setTimeout(() => {
    console.log("🔑 Enviando clave SSH...");
    child.stdin.write('Tecno/121212\n');
}, 4000);

child.on('close', (code) => {
    console.log(`\n🏁 Proceso de despliegue finalizado con código: ${code}`);
});
