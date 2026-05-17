const { spawn } = require('child_process');

const child = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'PreferredAuthentications=password',
    '-tt',
    'root@144.217.163.13',
    'cd /opt/javiermix/web_0504/ && git log -n 1'
], { 
    stdio: ['pipe', 'inherit', 'inherit'] 
});

setTimeout(() => {
    child.stdin.write('Tecno/121212\n');
}, 3000);
