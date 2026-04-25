const { spawn } = require('child_process');

function runPurge() {
    console.log('--- STARTING VPS FINAL PURGE ---');
    
    // We want to KEEP anything related to the current stack
    const whitelist = ['javiermix_db', 'javiermix_web', 'javiermix_redis', 'javiermix_directus', 'javiermix_stats', 'javiermix_caddy'];
    
    // Command to get all container names
    const getNames = "docker ps -a --format '{{.Names}}'";
    
    const child = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', 'root@144.217.163.13', getNames], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    let output = '';
    child.stdout.on('data', (d) => output += d.toString());
    child.stderr.on('data', (d) => {
        if (d.toString().includes('password:')) child.stdin.write('Tecno/121212\n');
    });

    child.on('close', () => {
        const names = output.split('\n').map(n => n.trim()).filter(n => n && !whitelist.includes(n));
        if (names.length === 0) {
            console.log('No ghost containers found.');
            return;
        }
        
        console.log('GHOSTS FOUND:', names.join(', '));
        const stopCmd = `docker stop ${names.join(' ')} && docker rm ${names.join(' ')} && docker image prune -a -f`;
        const purgeChild = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', 'root@144.217.163.13', stopCmd], { stdio: ['pipe', 'pipe', 'pipe'] });
        purgeChild.stdout.on('data', (d) => console.log(d.toString()));
        purgeChild.stderr.on('data', (d) => {
            if (d.toString().includes('password:')) purgeChild.stdin.write('Tecno/121212\n');
        });
        purgeChild.on('close', () => console.log('PURGE COMPLETE'));
    });
}

runPurge();
