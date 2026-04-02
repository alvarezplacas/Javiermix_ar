const { execSync } = require('child_process');
const fs = require('fs');
try {
  const out = execSync('npx astro build --verbose', { env: { ...process.env, CI: 'true' } });
  fs.writeFileSync('build_debug.log', out);
} catch (e) {
  fs.writeFileSync('build_debug.log', (e.stdout ? e.stdout.toString() : '') + '\n' + (e.stderr ? e.stderr.toString() : ''));
}
