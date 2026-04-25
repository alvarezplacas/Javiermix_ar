const { spawn } = require('child_process');

async function proveIdentity() {
    console.log('--- IDENTITY AUDIT ---');
    console.log('LOCAL MACHINE (Your PC):');
    const local = spawn('hostname');
    local.stdout.on('data', (d) => console.log('Hostname: ' + d.toString().trim()));
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('\nREMOTE SERVER (VPS):');
    const remote = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', 'root@144.217.163.13', 'hostname && curl -s ifconfig.me'], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    remote.stdout.on('data', (d) => console.log(d.toString().trim()));
    remote.stderr.on('data', (d) => {
        if (d.toString().includes('password:')) {
            remote.stdin.write('Tecno/121212\n');
        }
    });

    remote.on('close', (code) => console.log('\n--- AUDIT FINISHED ---'));
}

proveIdentity();
