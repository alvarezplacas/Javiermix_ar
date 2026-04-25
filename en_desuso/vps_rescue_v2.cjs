const { spawn } = require('child_process');
const child = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', 'root@144.217.163.13', 'docker system prune -f && echo "DNS FIX" && printf "{\\n  \\"dns\\": [\\"8.8.8.8\\", \\"1.1.1.1\\"]\\n}" > /etc/docker/daemon.json && systemctl restart docker && cd /opt/javiermix/web_0504/ && docker compose up -d --force-recreate'], { stdio: ['pipe', 'pipe', 'pipe'] });

child.stdout.on('data', (data) => console.log('STDOUT: ' + data));
child.stderr.on('data', (data) => {
    const msg = data.toString();
    console.log('STDERR: ' + msg);
    if (msg.includes('password:') || msg.includes('Password:')) {
        console.log('Detected password prompt. Sending password...');
        child.stdin.write('Tecno/121212\n');
    }
});

child.on('close', (code) => console.log('Process exited with code ' + code));

setTimeout(() => {
    console.log('Safety timeout triggered. Sending password anyway...');
    child.stdin.write('Tecno/121212\n');
}, 10000);
