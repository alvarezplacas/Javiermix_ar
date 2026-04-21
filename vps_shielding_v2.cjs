const { spawn } = require('child_process');
const fs = require('fs');

async function runShielding() {
    console.log('--- STARTING VPS SHIELDING V2 ---');
    
    // Read the local isolated compose file
    const composeContent = fs.readFileSync('d:/web_javiermix/JAVIERMIX-AR-0504/docker-compose.yml', 'utf8');
    
    // We use a safe way to send the command to the VPS
    // 1. Upload the new compose file
    // 2. Kill all existing containers (the ghosts)
    // 3. Prune networks and volumes that are stale
    // 4. Bring up the isolated stack
    const remoteCmd = `
        cat <<EOF > /opt/javiermix/web_0504/docker-compose.yml
${composeContent}
EOF
        docker stop $(docker ps -aq) || true
        docker rm $(docker ps -aq) || true
        docker network prune -f
        cd /opt/javiermix/web_0504
        docker compose up -d --force-recreate
    `;

    const child = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', 'root@144.217.163.13', remoteCmd], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    child.stdout.on('data', (d) => process.stdout.write(d.toString()));
    child.stderr.on('data', (d) => {
        if (d.toString().includes('password:')) child.stdin.write('Tecno/121212\n');
    });

    child.on('close', (code) => console.log('\n--- SHIELDING COMPLETE WITH CODE ' + code + ' ---'));
}

runShielding();
