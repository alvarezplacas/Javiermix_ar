const { spawn } = require('child_process');

const child = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'PreferredAuthentications=password',
    '-tt',
    'root@144.217.163.13',
    'docker ps --filter name=javiermix'
], { 
    stdio: ['pipe', 'inherit', 'inherit'] 
});

setTimeout(() => {
    child.stdin.write('Tecno/121212\n');
}, 3000);
