const { spawn } = require('child_process');

async function deploy(password) {
    return new Promise((resolve) => {
        console.log(`Intentando desplegar con password...`);
        const command = `cd /opt/javiermix/web_0504/ && git pull origin master && docker compose up -d --build web_javiermix`;
        const child = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', 'root@144.217.163.13', command], { stdio: ['pipe', 'inherit', 'inherit'] });
        
        setTimeout(() => {
            child.stdin.write(password + '\n');
        }, 5000);

        child.on('close', (code) => {
            resolve(code === 0);
        });
    });
}

async function run() {
    const passwords = ['JavierMix2026!', 'Tecno/121212', 'Tecno121212'];
    for (const pw of passwords) {
        console.log(`Probando Password...`);
        if (await deploy(pw)) {
            console.log('✅ Despliegue exitoso.');
            process.exit(0);
        }
    }
    console.log('❌ Todos los passwords fallaron o hubo error en el comando.');
    process.exit(1);
}

run();
