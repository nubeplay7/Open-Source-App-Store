const { execFileSync } = require('child_process');

const SSH_KEY = 'C:\\Users\\asus\\.ssh\\id_rsa_antigravity';
const HOST = 'Usuario@192.168.1.74';

const args = process.argv.slice(2).join(' ');

try {
  const remoteCmd = `adb -s R8YY500R7ZB ${args}`;
  const out = execFileSync('ssh', [
    '-i', SSH_KEY,
    '-o', 'BatchMode=yes',
    '-o', 'StrictHostKeyChecking=no',
    HOST,
    remoteCmd
  ], { encoding: 'utf-8', timeout: 120000 });
  console.log(out);
} catch (e) {
  console.error('Error executing ADB:', e.message);
  if (e.stdout) console.log('STDOUT:', e.stdout);
  if (e.stderr) console.error('STDERR:', e.stderr);
}
