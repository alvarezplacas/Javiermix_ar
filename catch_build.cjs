const { execSync } = require('child_process');
try {
  console.log("Running astro build...");
  execSync('npx astro build', { stdio: 'pipe' });
  console.log("Build succeeded.");
} catch (e) {
  console.log("STDOUT:");
  console.log(e.stdout ? e.stdout.toString() : "");
  console.log("STDERR:");
  console.error(e.stderr ? e.stderr.toString() : "");
}
