const { spawn } = require('child_process');

// ============================================================
// 🚀 Deploy Fix - Rostros De Metal
// Hace pull del último commit y rebuild del contenedor web
// VPS: /opt/javiermix/web_0504/
// ============================================================

const REMOTE_CMD = `
  cd /opt/javiermix/web_0504 &&
  git pull origin master &&
  docker compose build --no-cache web_javiermix &&
  docker compose up -d web_javiermix &&
  echo "✅ DEPLOY COMPLETO"
`;

function deploy() {
    console.log('🚀 Conectando al VPS para hacer pull y rebuild...\n');

    const child = spawn('ssh', [
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'ConnectTimeout=15',
        'root@144.217.163.13',
        REMOTE_CMD
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

    child.stdout.on('data', (d) => process.stdout.write(d.toString()));

    child.stderr.on('data', (d) => {
        const msg = d.toString();
        if (msg.includes('password:')) {
            child.stdin.write('Tecno/121212\n');
        } else {
            process.stderr.write(msg);
        }
    });

    child.on('close', (code) => {
        if (code === 0) {
            console.log('\n✅ Listo. javiermix.ar actualizado con el fix de Rostros De Metal.');
        } else {
            console.log('\n❌ El deploy terminó con código ' + code + '. Revisar output arriba.');
        }
    });
}

deploy();
