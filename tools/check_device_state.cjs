const { execSync } = require('child_process');

const SSH_KEY = 'C:\\Users\\asus\\.ssh\\id_rsa_antigravity';
const THINKPAD_HOST = 'Usuario@192.168.1.74';

function runThinkPad(cmd) {
  return execSync(`ssh -i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=no ${THINKPAD_HOST} "${cmd}"`, { encoding: 'utf-8', timeout: 15000 });
}

console.log('=== VERIFICANDO ESTADO DE R8YY500R7ZB ===');
try {
  const state = runThinkPad('adb -s R8YY500R7ZB get-state');
  console.log('ESTADO:', state.trim());
} catch (e) {
  console.log('Fallo get-state:', e.message.split('\n')[0]);
}

try {
  const usbLog = runThinkPad('powershell -NoProfile -Command "Get-WinEvent -LogName Microsoft-Windows-Kernel-PnP/Configuration -MaxEvents 5 -ErrorAction SilentlyContinue | Select-Object TimeCreated, Message | Format-List"');
  console.log('PnP Events recientes:\n', usbLog);
} catch (e) {
  console.log('PnP event error:', e.message.split('\n')[0]);
}
