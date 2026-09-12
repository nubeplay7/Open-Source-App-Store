const { execSync } = require('child_process');

const SSH_KEY = 'C:\\Users\\asus\\.ssh\\id_rsa_antigravity';
const THINKPAD_HOST = 'Usuario@100.96.218.12';

function runThinkPad(cmd) {
  return execSync(`ssh -i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${THINKPAD_HOST} "${cmd}"`, { encoding: 'utf-8', timeout: 30000 });
}

console.log('=== REINICIANDO ADB SERVER EN THINKPAD ===');
try {
  runThinkPad('adb kill-server');
  console.log('adb kill-server ejecutado.');
} catch (e) {
  console.log('kill-server info:', e.message.split('\n')[0]);
}

try {
  const startOut = runThinkPad('adb start-server');
  console.log('start-server:', startOut);
} catch (e) {
  console.log('start-server info:', e.message.split('\n')[0]);
}

try {
  const devices = runThinkPad('adb devices -l');
  console.log('DEVICES:\n', devices);
} catch (e) {
  console.log('devices error:', e.message.split('\n')[0]);
}
