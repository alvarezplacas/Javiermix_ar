const { spawn } = require('child_process');
const child = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', 'root@144.217.163.13', 'docker system prune -f && echo -e "{\n  \"dns\": [\"8.8.8.8\", \"1.1.1.1\"]\n}" > /etc/docker/daemon.json && systemctl restart docker && sleep 5 && cd /opt/javiermix/web_0504/ && docker compose up -d --force-recreate'], { stdio: ['pipe', 'inherit', 'inherit'] });

setTimeout(() => {
    child.stdin.write('Tecno/121212\n');
    console.log('Password sent');
}, 5000);

child.on('close', (code) => {
    console.log('Process exited with code ' + code);
});
