const { spawn } = require('child_process');
const child = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', 'root@144.217.163.13', 'docker system prune -f && printf "{\n  \"dns\": [\"8.8.8.8\", \"1.1.1.1\"]\n}" > /etc/docker/daemon.json && systemctl restart docker && cd /opt/javiermix/web_0504/ && docker compose up -d --force-recreate'], { stdio: ['pipe', 'inherit', 'inherit'] });
setTimeout(() => {
    child.stdin.write('Tecno/121212\n');
}, 5000);
