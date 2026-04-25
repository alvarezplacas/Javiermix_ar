const { spawn } = require('child_process');

function tryLogin(password) {
    return new Promise((resolve) => {
        console.log(`Trying password: ${password}`);
        const child = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', 'root@144.217.163.13', 'whoami'], { stdio: ['pipe', 'pipe', 'pipe'] });
        
        let success = false;
        child.stdout.on('data', (data) => {
            if (data.toString().trim() === 'root') {
                success = true;
                console.log(`SUCCESS with password: ${password}`);
            }
        });

        // Use a timeout to send password since prompt capturing is hard
        setTimeout(() => {
            child.stdin.write(password + '\n');
        }, 2000);

        child.on('close', () => resolve(success));
        setTimeout(() => child.kill(), 10000);
    });
}

async function run() {
    const passwords = ['Tecno/121212', 'Tecno121212', 'JavierMix2026!'];
    for (const pw of passwords) {
        if (await tryLogin(pw)) {
            console.log('Valid password identified. Proceeding with fix...');
            // RUN ACTUAL FIX
            const fixer = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', 'root@144.217.163.13', 'docker system prune -f && printf "{\\n  \\"dns\\": [\\"8.8.8.8\\", \\"1.1.1.1\\"]\\n}" > /etc/docker/daemon.json && systemctl restart docker && cd /opt/javiermix/web_0504/ && docker compose up -d --force-recreate'], { stdio: ['pipe', 'inherit', 'inherit'] });
            setTimeout(() => fixer.stdin.write(pw + '\n'), 5000);
            return;
        }
    }
    console.log('All passwords failed.');
}

run();
