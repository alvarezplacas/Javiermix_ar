const { spawn } = require('child_process');

function runReboot() {
    console.log('--- STARTING CLEAN REBOOT OF VPS STACK ---');
    
    // Commands to run on the VPS
    // 1. Stop every single container on the system
    // 2. Wipe all unused data (images, networks, build cache)
    // 3. Bring up ONLY the javiermix 0504 stack
    const remoteCmd = `
        docker stop $(docker ps -aq) || true
        docker rm $(docker ps -aq) || true
        docker network prune -f
        docker system prune -a -f
        cd /opt/javiermix/web_0504
        docker compose up -d --force-recreate
    `;

    const child = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', 'root@144.217.163.13', remoteCmd], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    child.stdout.on('data', (d) => process.stdout.write(d.toString()));
    child.stderr.on('data', (d) => {
        const msg = d.toString();
        if (msg.includes('password:')) {
            child.stdin.write('Tecno/121212\n');
        } else {
            // Filter out the "npipe" error if it's local noise, but this time it shouldn't happen
            process.stderr.write(msg);
        }
    });

    child.on('close', (code) => console.log('\n--- REBOOT FINISHED WITH CODE ' + code + ' ---'));
}

runReboot();
