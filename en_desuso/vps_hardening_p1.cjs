const { spawn } = require('child_process');

function runHardening() {
    const commands = [
        'docker stop alvarezplacas_directus_v16 alvarezplacas_web snappymail alvarezplacas_db_v16 javiermix_files || true',
        'docker rm alvarezplacas_directus_v16 alvarezplacas_web snappymail alvarezplacas_db_v16 javiermix_files || true',
        'docker image prune -a -f',
        'docker network create javiermix_internal --internal || true',
        'docker network create alvarezplacas_internal --internal || true'
    ];
    
    const cmd = commands.join(' && echo "---" && ');
    const child = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', 'root@144.217.163.13', cmd], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    child.stdout.on('data', (d) => process.stdout.write(d.toString()));
    child.stderr.on('data', (d) => {
        const msg = d.toString();
        if (msg.includes('password:')) {
            child.stdin.write('Tecno/121212\n');
        } else {
            process.stderr.write(msg);
        }
    });

    child.on('close', (code) => console.log('\n--- HARDENING PHASE 1 FINISHED ---'));
}

runHardening();
