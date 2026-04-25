const { spawn } = require('child_process');

function runAudit() {
    const commands = [
        'docker ps -a --format "{{.Names}} | {{.Image}} | {{.Status}} | {{.Ports}}"',
        'docker network ls',
        'df -h',
        'free -m'
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

    child.on('close', (code) => console.log('\n--- AUDIT FINISHED ---'));
}

runAudit();
