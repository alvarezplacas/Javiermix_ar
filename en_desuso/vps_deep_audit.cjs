const { spawn } = require('child_process');

async function testSSH(password) {
    return new Promise((resolve) => {
        console.log(`\nTesting Password: [${password}]`);
        const child = spawn('ssh', [
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'ConnectTimeout=10',
            '-o', 'NumberOfPasswordPrompts=1',
            'root@144.217.163.13',
            'echo "AUTH_SUCCESS" && cd /opt/javiermix/web_0504 && git log -1 --format=%B && git status'
        ], { stdio: ['pipe', 'pipe', 'pipe'] });

        let output = '';
        let error = '';
        let resolved = false;

        child.stdout.on('data', (d) => {
            output += d.toString();
            if (output.includes('AUTH_SUCCESS')) {
                console.log('✅ AUTH SUCCESSFUL!');
            }
        });

        child.stderr.on('data', (d) => {
            const msg = d.toString();
            if (msg.includes('password:')) {
                child.stdin.write(password + '\n');
            } else {
                error += msg;
            }
        });

        child.on('close', (code) => {
            if (!resolved) {
                resolve({ code, output, error });
                resolved = true;
            }
        });

        setTimeout(() => {
            if (!resolved) {
                child.kill();
                resolve({ code: -1, output, error: 'TIMEOUT' });
                resolved = true;
            }
        }, 20000);
    });
}

async function audit() {
    const passwords = ['Tecno/121212', 'Tecno121212', 'JavierMix2026!'];
    for (const pw of passwords) {
        const result = await testSSH(pw);
        if (result.output.includes('AUTH_SUCCESS')) {
            console.log('\n--- VPS STATE ---');
            console.log(result.output);
            return;
        } else {
            console.log(`❌ Failed: ${result.error || 'Unknown error'}`);
        }
    }
    console.log('\nFAILED ALL PASSWORDS');
}

audit();
